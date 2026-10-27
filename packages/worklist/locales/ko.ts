import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ko: LocaleBundle = {
  chrome: {
    conferencing: '화상회의',
    open: '열기',
    close: '닫기',
    searchPortal: '검색 포털',
    searchPortalTitle: 'IDC 검색 포털 열기',
    worklist: '워크리스트:',
    exploreIdc: 'NCI Imaging Data Commons 탐색:',
    viewers: '뷰어:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: '강의:',
    anatomicalPlanes: 'Classroom',
    currentContext: '현재 컨텍스트:',
    none: '없음',
    colStudy: '검사',
    colModalities: '모달리티',
    colFormat: '형식',
    colSize: '크기',
    language: '언어',
    openStudy: '검사 열기',
    closeStudy: '열린 검사 닫기',
    closeContext: '현재 컨텍스트 닫기',
    cannotOpen: '열 수 없음',
    saveWorklist: '저장',
    loadWorklist: '불러오기',
    saveWorklistTitle: '내 워크리스트를 JSON으로 저장',
    loadWorklistTitle: 'JSON에서 내 워크리스트 불러오기',
  },
  conference: CONFERENCE_BY_LOCALE.ko,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: '이 애플리케이션 정보',
    aboutLinkLabel: '정보',
    aboutLinkSuffix: '— 라이선스, 감사의 글, 상표.',
    quickStartTitle: '빠른 시작:',
    quickStartBody:
      '오른쪽의 {{open}} 버튼 중 하나를 클릭하여 CR을 열고 마법 지팡이 아이콘 {{magicWand}}으로 FleXray를 실행하세요.',
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
    howto0Title: '3D Slicer에 Worklist 연결하기.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Slicer Hub Interface 확장을 설치합니다</li>
        <li><strong>3D Slicer</strong>에서 <strong>Hub Interface</strong> 모듈을 연 다음 <strong>Image Display Client</strong> 섹션으로 이동합니다.</li>
        <li>허브로 <strong>SLICER-HUB-CLOUD</strong>를 선택합니다(이 워크리스트와 동일한 클라우드 허브). 포트 2018의 로컬 허브를 실행 중일 때만 <strong>SLICER-HUB</strong>를 사용하세요.</li>
        <li>OIDC를 사용하지 않으면 <strong>User</strong>를 클라우드 워크리스트(왼쪽 위)와 같은 사용자로 설정한 뒤 <strong>Connect</strong>를 클릭합니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>연결되면 워크리스트의 <strong>SlicerDesktop</strong> 뷰어 버튼이 활성화되고, 선택기가 «3D Slicer»로 바뀌며 Slicer DICOM 데이터베이스 내용이 표시됩니다. 목록에서 검사를 열면 데스크톱 Slicer에 로드됩니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="뷰어(SlicerDesktop 선택), 원격 AI, 검사 목록이 있는 Worklist" width="870" height="498" />
        </li>
        <li>브라우저 화상회의 / 라이브 보기는 <strong>SlicerLive</strong>와 <strong>화상회의</strong>를 사용하세요. 다른 사용자가 노드·카메라/프레젠테이션 변경을 따라갑니다.</li>
      </ol>
    `,
    howto1Title: '화상회의에 참가하기.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>워크리스트를 열고 오른쪽 위의 <strong>화상회의</strong>를 클릭합니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="화상회의가 강조된 SlicerLive 헤더" width="477" height="117" />
        </li>
        <li>허브 인스턴스에서 진행 중인 회의가 있으면 드롭다운에 표시됩니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="화상회의 참가: 활성 회의 드롭다운과 참가 버튼" width="322" height="175" />
        </li>
        <li>회의가 아직 시작되지 않았다면 참가 초대를 기다리세요:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="회의 초대: 참가하고 따라가기, 참가하되 따라가지 않기, 또는 참가하지 않기" width="190" height="141" />
        </li>
        <li>따라가기를 선택했다면 호스트의 검사와 프레젠테이션을 따랍니다. 언제든지 <strong>회의 나가기</strong>로 나갑니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="회의 나가기, 내 장소, 따라가는 참가자가 있는 헤더" width="397" height="80" />
        </li>
        <li>팔로우를 중지하면 다시 팔로우를 재개하거나 회의를 인수할 수 있습니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="팔로우 중지 후 팔로우 재개 및 인수 버튼이 있는 헤더" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: '화상회의 만들기.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>워크리스트를 열고 오른쪽 위의 <strong>화상회의</strong>를 클릭합니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="화상회의가 강조된 SlicerLive 헤더" width="477" height="117" />
        </li>
        <li>호스트로서 <strong>화상회의</strong>(워크리스트 헤더 또는 SlicerLive 바)를 클릭합니다. 제목을 선택하고 만들면 <strong>leading</strong> 장소가 됩니다.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="화상회의 만들기: 제목 필드 및 화상회의 만들기 버튼" width="167" height="192" />
        </li>
        <li>리딩 중 SlicerLive의 변경(레이아웃, 윈도우/레벨, 세그먼트 가시성, 카메라, MPR 스크롤/팬/줌, 사라지는 잉크 및 유사한 장면 업데이트)이 팔로워에게 전달됩니다.</li>
        <li>모두를 위해 <strong>화상회의 종료</strong>할 수 있습니다. 리딩 중 <strong>B</strong> 단축키로 사라지는 잉크를 켜고 끕니다.</li>
        <li>단일 데스크톱에서 <strong>Open another user</strong> 버튼으로 화상회의를 테스트할 수 있습니다. 데모 동영상: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'IDC 검색 및 개인 목록에 추가하기.',
    howto4Title: '로컬 검사를 뷰어에 불러오기.',
    howto5Title: '원격 AI 사용하기',
    howto6Title: '3D 프린팅용 STL로 세그먼트 내보내기.',
    howto7Title: 'Reporting / DICOM SR 사용하기.',
  },
};
