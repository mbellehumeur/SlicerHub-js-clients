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
    worklist: 'Worklist:',
    exploreIdc: 'Explorar o NCI Imaging Data Commons:',
    viewers: 'Visualizadores:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curso:',
    anatomicalPlanes: 'Classroom',
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
    saveWorklist: 'Guardar',
    loadWorklist: 'Carregar',
    saveWorklistTitle: 'Guardar a minha worklist como JSON',
    loadWorklistTitle: 'Carregar a minha worklist a partir de JSON',
  },
  conference: CONFERENCE_BY_LOCALE.pt,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Acerca desta aplicação',
    aboutLinkLabel: 'Acerca',
    aboutLinkSuffix: '— licenças, agradecimentos e marcas.',
    quickStartTitle: 'Início rápido:',
    quickStartBody:
      'Clique num dos botões {{open}} à direita para abrir um CR e usar o ícone de varinha mágica {{magicWand}} para executar o FleXray.',
    introHtml: `
        <p>
          This application uses the
          <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) together with
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">WebSub integration</a>
          and open-source viewers to provide a collaborative conferencing
          environment for education. Lessons are organized as
          <strong>courses</strong> that educators can extend by adding folders
          under the courses folder.
        </p>
        <p>
          The IDC is part of the NCI Cancer Research Data Commons. It hosts large,
          publicly available collections of cancer imaging data in the cloud so
          researchers, clinicians, and educators can explore real clinical-grade
          studies without setting up their own archive.
        </p>
        <p>
          IDC invests in education and open tooling so students and teachers can
          learn medical imaging with authentic data, reproducible workflows, and
          freely available viewers—not only research pipelines.
        </p>
        <p>
          Viewing is powered by open-source platforms that share IDC’s commitment
          to accessible medical imaging:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="https://ohif.org/" target="_blank" rel="noopener">OHIF</a>
            — a web-based medical image viewer built on open standards (including
            DICOMweb). It is widely used in research and education, and is designed
            so modes and extensions can grow with teaching and clinical workflows.
          </li>
          <li>
            <a href="https://github.com/ImagingDataCommons/slim" target="_blank" rel="noopener">Slim</a>
            — an interoperable slide microscopy viewer from the Imaging Data
            Commons (National Cancer Institute), for teaching and research with
            whole-slide imaging.
          </li>
          <li>
            <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>
            — a desktop platform for visualization, analysis, and research.
            <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>
            runs as a Slicer extension so Classroom, conferencing, and image
            display can share one open messaging stack with the same data and tools.
          </li>
        </ul>
        <p>
          For free, open anatomy education, see the
          <a href="https://www.openanatomy.org/" target="_blank" rel="noopener">Open Anatomy Project</a>
          at Brigham and Women’s Hospital. It distributes high-quality anatomy
          atlases and open-source software worldwide—democratizing medical
          knowledge for students, clinicians, researchers, and the public,
          wherever they live and in many languages. Atlases are viewed in the
          web-based Open Anatomy Browser; the group also created
          <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>,
          which was used to build the atlases.
        </p>
        <p>
          The University of Twente
          <a href="https://bonehub.github.io/Educational-Atlas/" target="_blank" rel="noopener">BoneHub Educational Atlas</a>
          offers interactive full-skeleton 3D models of the Visible Human Male
          and Female for teaching, visualization, and 3D printing. Free STL
          meshes and IGES/STEP CAD files (CC BY 4.0) are available from the
          <a href="https://huggingface.co/datasets/BoneHub/visible-human-3d-models" target="_blank" rel="noopener">visible-human-3d-models</a>
          dataset on Hugging Face.
        </p>
    `,
    howto0Title: 'Como ligar o Worklist ao 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist com visualizadores (SlicerDesktop selecionado), IA remota e lista de estudos" width="870" height="498" />
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
        <li>Como anfitrião, clique em <strong>Conferência</strong> (cabeçalho ou barra SlicerLive). Escolha um título e crie — torna-se o lugar <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Criar conferência: campo de título e botão Criar conferência" width="167" height="192" />
        </li>
        <li>Enquanto lidera, as alterações no SlicerLive (layout, janela/nível, visibilidade de segmentos, câmara, scroll/pan/zoom MPR, tinta efémera e atualizações de cena semelhantes) são propagadas aos seguidores.</li>
        <li>Pode <strong>Terminar a conferência</strong> para todos. Enquanto lidera, use a tecla <strong>B</strong> para ativar/desativar a tinta efémera.</li>
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
