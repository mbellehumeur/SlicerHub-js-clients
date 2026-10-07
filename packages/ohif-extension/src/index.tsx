import { Types } from '@ohif/core';
import HubService from './services/HubService';
import getCommandsModule from './commandsModule';
import getDataSourcesModule from './getDataSourcesModule';
import getCustomizationModule from './getCustomizationModule';

const extension: Types.Extensions.Extension = {
  id: '@ohif/extension-hub',

  async preRegistration({ servicesManager }) {
    servicesManager.registerService(HubService.REGISTRATION);
  },

  getCommandsModule,
  getDataSourcesModule,
  getCustomizationModule,
};

export default extension;
