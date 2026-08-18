import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';

const API_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/{dharmiksoni}/character';

function emptySkillPoints() {
  return SKILL_LIST.reduce((points, skill) => {
    points[skill.name] = 0;
    return points;
  }, {});
}

function jsonResponse(body) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ statusCode: 200, body }),
  });
}

function characterSection(n) {
  return screen.getByRole('heading', { name: `Character ${n}` }).closest('div');
}

function attributeRow(section, name) {
  return within(section).getByText(new RegExp(`${name}:`)).closest('div');
}

beforeEach(() => {
  global.fetch = jest.fn(() => jsonResponse(undefined));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the app title', async () => {
  render(<App />);
  expect(screen.getByText(/React Coding Exercise/i)).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('loads characters from GET on start and uses the documented URL', async () => {
  global.fetch.mockImplementation(() =>
    jsonResponse({
      characters: [
        {
          attributes: {
            Strength: 12,
            Dexterity: 0,
            Constitution: 0,
            Intelligence: 0,
            Wisdom: 0,
            Charisma: 0,
          },
          skillPoints: emptySkillPoints(),
          selectedClass: null,
        },
      ],
    }),
  );

  render(<App />);
  await waitFor(() => expect(screen.getByText(/Strength: 12/)).toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledWith(API_URL);
});

test('increments and decrements attributes independently', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Character 1' })).toBeInTheDocument());

  const section = characterSection(1);
  const strength = attributeRow(section, 'Strength');
  const dexterity = attributeRow(section, 'Dexterity');

  userEvent.click(within(strength).getByRole('button', { name: '+' }));
  userEvent.click(within(strength).getByRole('button', { name: '+' }));
  userEvent.click(within(dexterity).getByRole('button', { name: '+' }));
  userEvent.click(within(strength).getByRole('button', { name: '-' }));

  expect(within(strength).getByText(/Strength: 1/)).toBeInTheDocument();
  expect(within(dexterity).getByText(/Dexterity: 1/)).toBeInTheDocument();
});

test('clicking a class shows its required stats from CLASS_LIST', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Barbarian' })).toBeInTheDocument());

  userEvent.click(screen.getByRole('button', { name: 'Barbarian' }));
  expect(screen.getByText(/Barbarian minimum requirements/)).toBeInTheDocument();
  expect(screen.getByText(`Strength: ${CLASS_LIST.Barbarian.Strength}`)).toBeInTheDocument();
});

test('bolds a class when the character meets its minimums', async () => {
  global.fetch.mockImplementation(() =>
    jsonResponse({
      characters: [
        {
          attributes: CLASS_LIST.Barbarian,
          skillPoints: emptySkillPoints(),
          selectedClass: null,
        },
      ],
    }),
  );

  render(<App />);
  await waitFor(() => expect(screen.getByText(/Strength: 14/)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Barbarian' })).toHaveStyle({ fontWeight: 'bold' });
  expect(screen.getByRole('button', { name: 'Wizard' })).toHaveStyle({ fontWeight: 'normal' });
});

test('blocks attribute increment at a total of 70', async () => {
  global.fetch.mockImplementation(() =>
    jsonResponse({
      characters: [
        {
          attributes: {
            Strength: 20,
            Dexterity: 10,
            Constitution: 10,
            Intelligence: 10,
            Wisdom: 10,
            Charisma: 10,
          },
          skillPoints: emptySkillPoints(),
          selectedClass: null,
        },
      ],
    }),
  );

  render(<App />);
  await waitFor(() => expect(screen.getByText(/Strength: 20/)).toBeInTheDocument());

  const strength = attributeRow(characterSection(1), 'Strength');
  userEvent.click(within(strength).getByRole('button', { name: '+' }));
  expect(within(strength).getByText(/Strength: 20/)).toBeInTheDocument();
});

test('does not spend skill points beyond the Intelligence budget', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Character 1' })).toBeInTheDocument());

  const section = characterSection(1);
  const acrobatics = within(section).getByText(/Acrobatics - points/).closest('div');
  userEvent.click(within(acrobatics).getByRole('button', { name: '+' }));
  expect(acrobatics).toHaveTextContent('points: 0');
});

test('spends skill points after Intelligence provides a budget', async () => {
  global.fetch.mockImplementation(() =>
    jsonResponse({
      characters: [
        {
          attributes: {
            Strength: 0,
            Dexterity: 0,
            Constitution: 0,
            Intelligence: 10,
            Wisdom: 0,
            Charisma: 0,
          },
          skillPoints: emptySkillPoints(),
          selectedClass: null,
        },
      ],
    }),
  );

  render(<App />);
  await waitFor(() => expect(screen.getByText(/Intelligence: 10/)).toBeInTheDocument());

  const section = characterSection(1);
  const acrobatics = within(section).getByText(/Acrobatics - points/).closest('div');
  userEvent.click(within(acrobatics).getByRole('button', { name: '+' }));
  expect(acrobatics).toHaveTextContent('points: 1');
});

test('rolls a per-character skill check against DC', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);

  render(<App />);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Character 1' })).toBeInTheDocument());

  const section = characterSection(1);
  const dcInputs = within(section).getAllByRole('spinbutton');
  userEvent.clear(dcInputs[0]);
  userEvent.type(dcInputs[0], '5');
  userEvent.click(within(section).getByRole('button', { name: 'Roll' }));

  expect(section).toHaveTextContent('Success');
  expect(section).toHaveTextContent(/Roll: 11/);
});

test('adds a second character and party-check picks the higher skill total', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);

  global.fetch.mockImplementation(() =>
    jsonResponse({
      characters: [
        {
          attributes: ATTRIBUTE_LIST.reduce((attrs, name) => {
            attrs[name] = 0;
            return attrs;
          }, {}),
          skillPoints: emptySkillPoints(),
          selectedClass: null,
        },
        {
          attributes: {
            Strength: 0,
            Dexterity: 14,
            Constitution: 0,
            Intelligence: 0,
            Wisdom: 0,
            Charisma: 0,
          },
          skillPoints: { ...emptySkillPoints(), Acrobatics: 3 },
          selectedClass: null,
        },
      ],
    }),
  );

  render(<App />);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Character 2' })).toBeInTheDocument());

  const partyDc = screen.getAllByRole('spinbutton')[0];
  userEvent.clear(partyDc);
  userEvent.type(partyDc, '1');
  userEvent.click(screen.getAllByRole('button', { name: 'Roll' })[0]);

  expect(screen.getByText(/Character 2 was chosen/)).toBeInTheDocument();
  expect(screen.getByText(/skill total: 5/)).toBeInTheDocument();
});

test('Add Character creates another sheet', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Character 1' })).toBeInTheDocument());
  userEvent.click(screen.getByRole('button', { name: 'Add Character' }));
  expect(screen.getByRole('heading', { name: 'Character 2' })).toBeInTheDocument();
});

test('Save POSTs JSON to the documented URL with application/json', async () => {
  render(<App />);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  expect(global.fetch).toHaveBeenLastCalledWith(
    API_URL,
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  const posted = JSON.parse(global.fetch.mock.calls[1][1].body);
  expect(Array.isArray(posted.characters)).toBe(true);
});
