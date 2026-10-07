import { Types } from '@ohif/core';
import HubService from './services/HubService';

const commandsModule = ({
  servicesManager,
}: Types.Extensions.ExtensionParams): Types.Extensions.CommandsModule => {
  const getHubService = () =>
    servicesManager.services.hubService as InstanceType<typeof HubService>;

  const actions = {
    hubPublishDicomSeries: async () => {
      return getHubService().publishDicomSendSeries();
    },
    hubPublishDicomStudy: async () => {
      return getHubService().publishDicomSendStudy();
    },
  };

  const definitions = {
    hubPublishDicomSeries: {
      commandFn: actions.hubPublishDicomSeries,
      storeContexts: [],
      options: {},
    },
    hubPublishDicomStudy: {
      commandFn: actions.hubPublishDicomStudy,
      storeContexts: [],
      options: {},
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'HUB',
  };
};

export default commandsModule;
