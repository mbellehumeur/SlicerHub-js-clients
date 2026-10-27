import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ar: LocaleBundle = {
  chrome: {
    conferencing: 'المؤتمرات',
    open: 'فتح',
    close: 'إغلاق',
    searchPortal: 'بوابة البحث',
    searchPortalTitle: 'فتح بوابة بحث IDC',
    worklist: 'قائمة العمل:',
    exploreIdc: 'استكشف NCI Imaging Data Commons:',
    viewers: 'العارضات:',
    reportingClients: 'منشئو التقارير:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'المقرر:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'السياق الحالي:',
    none: 'لا شيء',
    colStudy: 'دراسة',
    colModalities: 'الطرائق',
    colFormat: 'التنسيق',
    colSize: 'الحجم',
    language: 'اللغة',
    openStudy: 'فتح الدراسة',
    closeStudy: 'إغلاق الدراسة المفتوحة',
    closeContext: 'إغلاق السياق الحالي',
    cannotOpen: 'تعذّر الفتح',
    saveWorklist: 'حفظ',
    loadWorklist: 'تحميل',
    saveWorklistTitle: 'حفظ قائمة عملي كـ JSON',
    loadWorklistTitle: 'تحميل قائمة عملي من JSON',
  },
  conference: CONFERENCE_BY_LOCALE.ar,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'حول هذا التطبيق',
    aboutLinkLabel: 'حول',
    aboutLinkSuffix: '— التراخيص والإقرارات والعلامات التجارية.',
    quickStartTitle: 'بداية سريعة:',
    quickStartBody:
      'انقر أحد أزرار {{open}} على اليمين لفتح CR واستخدام أيقونة العصا السحرية {{magicWand}} لتشغيل FleXray.',
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
    howto0Title: 'كيفية ربط Worklist بـ 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>ثبّت امتداد Slicer Hub Interface</li>
        <li>في <strong>3D Slicer</strong>، افتح وحدة <strong>Hub Interface</strong> ثم قسم <strong>Image Display Client</strong>.</li>
        <li>اختر المركز <strong>SLICER-HUB-CLOUD</strong> (نفس مركز السحابة لهذه قائمة العمل). استخدم <strong>SLICER-HUB</strong> فقط عند تشغيل مركز محلي على المنفذ 2018.</li>
        <li>بدون OIDC، عيّن <strong>User</strong> إلى نفس مستخدم قائمة العمل السحابية (أعلى اليسار)، ثم انقر <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: مركز SLICER-HUB-CLOUD، موضوع معيّن، Connect، حالة Connected" width="585" height="127" />
        </li>
        <li>عند الاتصال، يضيء زر العارض <strong>SlicerDesktop</strong>، ويتغيّر محدد القائمة إلى «3D Slicer» وتعرض القائمة محتوى قاعدة DICOM في Slicer. افتح دراسة من القائمة — تُحمَّل في Slicer لسطح المكتب.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist مع العارضات (SlicerDesktop محدّد) والذكاء الاصطناعي عن بُعد وقائمة الدراسات" width="870" height="498" />
        </li>
        <li>للمؤتمرات / العرض المباشر في المتصفح، استخدم <strong>SlicerLive</strong> و<strong>المؤتمرات</strong> عندما يتابع الآخرون تغييرات العقدة والكاميرا/العرض.</li>
      </ol>
    `,
    howto1Title: 'كيفية الانضمام إلى مؤتمر.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>افتح قائمة العمل وانقر <strong>المؤتمرات</strong> أعلى اليمين.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="شريط SlicerLive مع تمييز المؤتمرات" width="477" height="117" />
        </li>
        <li>إذا كان مؤتمر جارياً على مثيل المركز لديك، يظهر في قائمة منسدلة.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="الانضمام إلى مؤتمر: قائمة المؤتمرات النشطة وزر الانضمام" width="322" height="175" />
        </li>
        <li>إذا لم يبدأ المؤتمر بعد، انتظر الدعوة للانضمام:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="دعوة مؤتمر: انضم واتبع، انضم دون متابعة، أو عدم الانضمام" width="190" height="141" />
        </li>
        <li>إذا اخترت المتابعة، تتابع دراسة المضيف وعرضه. غادر في أي وقت عبر <strong>مغادرة المؤتمر</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="الشريط مع مغادرة المؤتمر ومكانك ومشارك يتابع" width="397" height="80" />
        </li>
        <li>إذا أوقفت المتابعة، يمكنك بعدها استئناف المتابعة أو تولي قيادة المؤتمر.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="الشريط مع استئناف المتابعة وتولي القيادة بعد إيقاف المتابعة" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'كيفية إنشاء مؤتمر.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>افتح قائمة العمل وانقر <strong>المؤتمر</strong> في أعلى اليمين.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="رأس SlicerLive مع تمييز المؤتمر" width="477" height="117" />
        </li>
        <li>كمضيف، انقر <strong>المؤتمر</strong> (رأس قائمة العمل أو شريط SlicerLive). اختر عنواناً وأنشئه — تصبح المكان <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="إنشاء مؤتمر: حقل العنوان وزر إنشاء مؤتمر" width="167" height="192" />
        </li>
        <li>أثناء القيادة، تُبث تغييرات SlicerLive (التخطيط، النافذة/المستوى، رؤية الشرائح، الكاميرا، تمرير/تحريك/تكبير MPR، الحبر المتلاشي وتحديثات المشهد المشابهة) إلى المتابعين.</li>
        <li>يمكنك <strong>إنهاء المؤتمر</strong> للجميع. أثناء القيادة استخدم مفتاح <strong>B</strong> لتبديل الحبر المتلاشي.</li>
        <li>يمكنك اختبار المؤتمر على جهاز واحد عبر زر <strong>Open another user</strong>. شاهد فيديو العرض: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'كيفية البحث في IDC والإضافة إلى قائمة شخصية.',
    howto4Title: 'كيفية تحميل دراسة محلية إلى عارض.',
    howto5Title: 'كيفية استخدام الذكاء الاصطناعي عن بُعد',
    howto6Title: 'كيفية تصدير مقطع إلى ملف STL للطباعة ثلاثية الأبعاد.',
    howto7Title: 'كيفية استخدام التقارير / DICOM SR.',
  },
};
