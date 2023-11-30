import Button from './index';

export default {
  title: 'Styled Button',
  component: Button,
  args: {
    title: 'Hello world',
  },
};

export const Basic = (props: any) => <Button {...props} />;
