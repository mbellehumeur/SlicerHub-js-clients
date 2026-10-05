import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const pt: LocaleBundle = {
  chrome: {
    conferencing: 'Conferência',
    open: 'Abrir',
    close: 'Fechar',
    searchPortal: 'Portal de pesquisa',
    searchPortalTitle: 'Abrir o portal de pesquisa IDC',
    worklist: 'Worklist',
    exploreIdc: 'Explorar o NCI Imaging Data Commons:',
    viewers: 'Visualizadores:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curso:',
    currentContext: 'Contexto atual:',
    none: 'nenhum',
    colStudy: 'Estudo',
    colModalities: 'Modalidades',
    colFormat: 'Formato',
    colSize: 'Tamanho',
    language: 'Idioma',
    openStudy: 'Abrir estudo',
    closeStudy: 'Fechar o estudo aberto',
    closeContext: 'Fechar o contexto atual',
    cannotOpen: 'Não é possível abrir',
  },
  conference: CONFERENCE_BY_LOCALE.pt,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Acerca desta aplicação',
    aboutLinkLabel: 'Acerca',
    aboutLinkSuffix: '— licenças, agradecimentos e marcas.',
    quickStartTitle: 'Início rápido:',
    quickStartBody:
      'Clique num dos botões {{open}} à direita para ver um estudo em 3D e MPR.',
    introHtml: `
        <p>
          O propósito original desta aplicação é ser um ator «worklist client» num sistema open source
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          O sistema destina-se a promover, formar, desenvolver e demonstrar a interoperabilidade em aplicações de imagem médica.
        </p>
        <p>A aplicação é portanto um componente (<strong>WORKLIST_CLIENT actor</strong>) de um sistema que inclui:</p>
        <ul class="wl-help-steps">
          <li>um hub WebSub (<strong>HUB actor</strong>) para a comunicação entre aplicações e utilizadores</li>
          <li>visualizadores open source de imagem médica (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>modelos de inferência open source (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>um exemplo de reporting DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>o <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> e a BD DICOM do <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> como arquivos só de leitura (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>um fornecedor de autenticação / identidade com integração aos endpoints OIDC do hub ou autenticação anónima/mock integrada no hub</li>
        </ul>
        <p>
          A aplicação inclui também funções de ensino de anatomia e patologia independentes do fluxo IHE:
        </p>
        <ul class="wl-help-steps">
          <li>criar, guardar e carregar ficheiros didáticos e cohortes</li>
          <li>conferência para visualização e ensino colaborativos</li>
          <li>um pincel efémero para anotações temporárias em conferência</li>
          <li>exportação STL para impressão 3D</li>
        </ul>
    `,
    howto0Title: 'Como ligar o SlicerWorklist ao 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Instale a extensão Slicer Hub Interface</li>
        <li>No <strong>3D Slicer</strong>, abra o módulo <strong>Hub Interface</strong> e a secção <strong>Image Display Client</strong>.</li>
        <li>Escolha o hub <strong>SLICER-HUB-CLOUD</strong> (o mesmo hub na nuvem que esta worklist). Use <strong>SLICER-HUB</strong> apenas se executar um hub local na porta 2018.</li>
        <li>Sem OIDC, defina <strong>User</strong> igual ao utilizador da sua worklist na nuvem (canto superior esquerdo) e clique em <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Ao ligar, o botão <strong>SlicerDesktop</strong> ativa-se, o seletor passa a «3D Slicer» e a lista mostra a base DICOM do Slicer. Abra um estudo — carrega no Slicer de ambiente de trabalho.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist com visualizadores (SlicerDesktop selecionado), IA remota e lista de estudos" width="870" height="498" />
        </li>
        <li>Para conferência / vista live no browser, use <strong>SlicerLive</strong> e <strong>Conferência</strong> quando outros seguem as suas alterações de nós e câmara/apresentação.</li>
      </ol>
    `,
    howto1Title: 'Como juntar-se a uma conferência.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Abra a worklist e clique em <strong>Conferência</strong> no canto superior direito.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Cabeçalho SlicerLive com Conferência destacada" width="477" height="117" />
        </li>
        <li>Se houver uma conferência em curso na sua instância do hub, será mostrada num menu pendente.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Participar numa conferência: menu de conferências ativas e botão Participar" width="322" height="175" />
        </li>
        <li>Se a conferência ainda não começou, aguarde o convite para participar:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Convite: Participar e seguir, Participar sem seguir, ou Não participar" width="190" height="141" />
        </li>
        <li>Se escolheu seguir, acompanha o estudo e a apresentação do anfitrião. Saia a qualquer momento com <strong>Sair da conferência</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Cabeçalho com Sair da conferência, o seu local e um participante a seguir" width="397" height="80" />
        </li>
        <li>Se deixar de seguir, pode depois retomar a seguir ou assumir a conferência.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Cabeçalho com Retomar a seguir e Assumir após parar de seguir" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Como criar uma conferência.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Abra a worklist e clique em <strong>Conferência</strong> no canto superior direito.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Cabeçalho SlicerLive com Conferência destacada" width="477" height="117" />
        </li>
        <li>Como anfitrião, clique em <strong>Conferência</strong> (cabeçalho da worklist ou barra SlicerLive). Escolha um título e crie — torna-se o local <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Criar conferência: campo de título e botão Criar conferência" width="167" height="192" />
        </li>
        <li>Enquanto lidera, as alterações no SlicerLive (layout, janela/nível, segmentos, câmara, MPR, tinta efémera, etc.) são enviadas aos seguidores.</li>
        <li>Enquanto lidera, use a tecla <strong>B</strong> para ativar/desativar a tinta efémera.</li>
        <li>Pode testar a conferência num único ambiente de trabalho com o botão <strong>Open another user</strong>. Veja o vídeo de demonstração: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Como pesquisar no IDC e adicionar a uma lista pessoal.',
    howto4Title: 'Como carregar um estudo local num visualizador.',
    howto5Title: 'Como usar a IA remota',
    howto6Title: 'Como exportar um segmento para STL para impressão 3D.',
    howto7Title: 'Como usar Reporting / DICOM SR.',
  },
};
