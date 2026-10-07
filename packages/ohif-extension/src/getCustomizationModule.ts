import hubHeaderStatusCustomization from './customizations/hubHeaderStatusCustomization';

export default function getCustomizationModule() {
  return [
    {
      name: 'default',
      value: hubHeaderStatusCustomization,
    },
  ];
}
