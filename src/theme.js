import { createTheme } from '@mantine/core';

const aquaticAqua = [
  '#E0FBFB',
  '#C3F8F8',
  '#94F2F2',
  '#66E8E8',
  '#3DD8D8',
  '#22C7C9',
  '#18B1B3',
  '#128E90',
  '#0D6D6F',
  '#084D4F',
];

const aquaticDark = [
  '#C8D9DE',
  '#9DB4BE',
  '#6E8791',
  '#4A6270',
  '#2D4350',
  '#1A3645',
  '#132630',
  '#0E1C24',
  '#09161E',
  '#08141B',
];

const aquaticGreen = [
  '#E6F9EF',
  '#C8F2D9',
  '#94E5B6',
  '#6DD897',
  '#58C27D',
  '#41AF63',
  '#33944F',
  '#277A3E',
  '#1C6130',
  '#144923',
];

const aquaticAmber = [
  '#FEF5E7',
  '#FDE9C2',
  '#FAD88E',
  '#F7C352',
  '#F2B94B',
  '#E0A52B',
  '#C28B1C',
  '#9E7114',
  '#7A580E',
  '#583E09',
];

const aquaticCoral = [
  '#FEF0F0',
  '#FCD7D7',
  '#F9AEAE',
  '#F68888',
  '#F56C6C',
  '#E04A4A',
  '#C23030',
  '#9E2020',
  '#7A1515',
  '#580D0D',
];

const aquaticBlue = [
  '#EDF6FE',
  '#D2E8FD',
  '#A8D3FC',
  '#7EBFFB',
  '#5CA9FF',
  '#3D8EE0',
  '#2B72C0',
  '#1F58A0',
  '#164180',
  '#0E2D60',
];

const aquaticGrayLight = [
  '#F8FAFB',
  '#F2F6F8',
  '#E8EEF2',
  '#D8E2E7',
  '#C5D2D9',
  '#A8BAC3',
  '#8FA3AE',
  '#6E8791',
  '#4A6270',
  '#2D4350',
];

const theme = createTheme({
  primaryColor: 'aqua',
  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  headings: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '1.75rem', lineHeight: '1.3' },
      h2: { fontSize: '1.375rem', lineHeight: '1.35' },
      h3: { fontSize: '1.125rem', lineHeight: '1.4' },
    },
  },

  defaultRadius: 'md',
  primaryShade: { light: 5, dark: 5 },

  colors: {
    aqua: aquaticAqua,
    dark: aquaticDark,
    green: aquaticGreen,
    yellow: aquaticAmber,
    red: aquaticCoral,
    blue: aquaticBlue,
    gray: aquaticGrayLight,
  },

  other: {
    aquatic: {
      accent: '#22C7C9',
      accentHover: '#18B1B3',
      success: '#58C27D',
      warning: '#F2B94B',
      error: '#F56C6C',
      info: '#5CA9FF',
    },
  },

  components: {
    Button: {
      defaultProps: { radius: 'md' },
    },
    Card: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: { radius: 'md' },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    NumberInput: {
      defaultProps: { radius: 'md' },
    },
    Select: {
      defaultProps: { radius: 'md' },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        striped: true,
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
      },
    },
    NavLink: {
      defaultProps: {
        color: 'aqua',
      },
    },
  },
});

export default theme;
