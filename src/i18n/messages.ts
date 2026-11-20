import type {
  AspectRatioMode,
  BlendMode,
  CameraView,
  DancePresetId,
  Locale,
  PaperStyle,
  PropStyle,
} from '../types/studio';

export interface StudioMessages {
  brandTitle: string;
  brandBadge: string;
  brandSubtitle: string;
  privacyNote: string;
  langSwitchLabel: string;
  sourceBarTitle: string;
  uploadBtn: string;
  pasteHint: string;
  doodleToggleOn: string;
  doodleToggleOff: string;
  samplePrefix: string;
  samples: Record<'cat' | 'stickman' | 'ghost' | 'starman', string>;
  stageLabel: string;
  stagePlay: string;
  stagePause: string;
  stageDragHint: string;
  stageDropOverlay: string;
  stageCompactTitle: string;
  stageFinishDoodle: string;
  cameraViews: Record<CameraView, string>;
  aspectShort: Record<AspectRatioMode, string>;
  doodleTitle: string;
  doodleSubtitle: string;
  doodlePenColors: string;
  doodleBrushSizes: [string, string, string];
  doodleEraser: string;
  doodleUndo: string;
  doodleClear: string;
  doodleGuideToggle: string;
  doodleGuideHint: string;
  presetsTitle: string;
  resetDefaultsBtn: string;
  presets: Record<DancePresetId, { name: string; desc: string }>;
  sliders: {
    speed: string;
    amplitude: string;
    depthAmplitude: string;
    distance: string;
    gloss: string;
    scale: string;
  };
  propTitle: string;
  props: Record<PropStyle, string>;
  paperTitle: string;
  papers: Record<PaperStyle, string>;
  blendTitle: string;
  blends: Record<BlendMode, { title: string; desc: string }>;
  inkEnhanceTitle: string;
  inkEnhanceDesc: string;
  exportTitle: string;
  exportSubtitle: string;
  aspectLabel: string;
  aspectSquare: string;
  aspectPortrait: string;
  sizeLabel: string;
  sizeLabels: Record<256 | 480 | 640, { title: string; tag: string }>;
  exportActionBtn: string;
  exportingText: string;
  cancelExportBtn: string;
  exportReadyTitle: string;
  downloadGifBtn: string;
  shareGifBtn: string;
  fileMeta: (kb: string, w: number, h: number, frames: number) => string;
  errors: {
    invalidFile: string;
    webglUnsupported: string;
    exportFailed: string;
  };
}

export const MESSAGES: Record<Locale, StudioMessages> = {
  'zh-TW': {
    brandTitle: '塗鴉搖搖鏡',
    brandBadge: '3D 筆頭反射跳舞機',
    brandSubtitle: '把倒畫塗鴉放進銀色圓錐筆頭前，真實光學反射站起來左右跳動！',
    privacyNote: '100% 瀏覽器本地光線追蹤，圖片不上傳、無浮水印',
    langSwitchLabel: 'EN',
    sourceBarTitle: '紙上主角',
    uploadBtn: '上傳圖片',
    pasteHint: '支援拖拉圖片或 Ctrl/Cmd+V 貼上',
    doodleToggleOn: '正在邊畫邊跳（點此收合畫板）',
    doodleToggleOff: '隨手塗鴉板（邊畫邊跳）',
    samplePrefix: '試玩範例：',
    samples: {
      cat: ':3 塗鴉貓',
      stickman: '開心小人',
      ghost: '飄飄幽靈',
      starman: '墨鏡酷哥',
    },
    stageLabel: '3D 反射舞台',
    stagePlay: '播放',
    stagePause: '暫停',
    stageDragHint: '在舞台拖拉或滑動，可以直接前後左右平行移動銀色筆頭！',
    stageDropOverlay: '放開圖片，馬上立起筆頭開跳！',
    stageCompactTitle: '筆頭即時反射中',
    stageFinishDoodle: '畫好了，調特效去',
    cameraViews: {
      full: '全景同框',
      closeup: '特寫筆頭',
    },
    aspectShort: {
      square: '1:1',
      portrait: '3:4',
    },
    doodleTitle: '隨手塗鴉筆記本',
    doodleSubtitle: '畫完直接倒放在筆頭前的橫線紙上，即時在銀錐中站起來跳舞！',
    doodlePenColors: '原子筆色',
    doodleBrushSizes: ['細', '中', '粗'],
    doodleEraser: '橡皮擦',
    doodleUndo: '復原',
    doodleClear: '清空',
    doodleGuideToggle: '描紅小貓參考線',
    doodleGuideHint: '參考線僅供臨摹，不會出現在筆頭反射或 GIF 中',
    presetsTitle: '選擇左右移動方式',
    resetDefaultsBtn: '重設微調',
    presets: {
      parallel: { name: '平行左右滑動', desc: '筆身垂直立正，平行左右＋微前後移動' },
      uhop: { name: '平行 U 字滑跳', desc: '筆身保持垂直，左右平移加前後跳' },
      hyper: { name: '平行左右快跳', desc: '雙倍節拍高速平行左右急跳' },
      orbit: { name: '平行畫圈滑動', desc: '筆身垂直繞小橢圓柔順滑動' },
      paper: { name: '筆不動・紙左右滑', desc: '筆固定原地，抽動下方紙張滑跳' },
    },
    sliders: {
      speed: '移動速度',
      amplitude: '左右移動幅度',
      depthAmplitude: '前後移動幅度',
      distance: '筆頭前後位置（遠近基準）',
      gloss: '金屬鏡面反光',
      scale: '紙上圖案大小',
    },
    propTitle: '反光器皿',
    props: {
      pen: '銀色圓錐筆頭',
      cup: '不鏽鋼銀杯',
      cone: '極簡亮銀大圓錐',
    },
    paperTitle: '筆記本紙樣式',
    papers: {
      lined: '橫線筆記本',
      grid: '方格紙',
      plain: '素白畫紙',
    },
    blendTitle: '圖片與紙面融合',
    blends: {
      ink: { title: '手繪融紙', desc: '白底透明化，像用筆直接畫在紙上' },
      sticker: { title: '彩色貼紙', desc: '保留完整原圖色彩與底色' },
    },
    inkEnhanceTitle: '拍紙塗鴉線條強化（去灰底）',
    inkEnhanceDesc: '手機拍筆記本灰灰暗暗？開啟後自動去紙底並加深墨線，乾淨融入橫線紙。',
    exportTitle: '匯出無縫循環 GIF',
    exportSubtitle: '與上方 3D 舞台所見即所得同步，自動對齊首尾無限循環',
    aspectLabel: '畫幅比例',
    aspectSquare: '1:1 正方形',
    aspectPortrait: '3:4 實拍直式',
    sizeLabel: '輸出尺寸',
    sizeLabels: {
      256: { title: '256px', tag: '貼圖輕量' },
      480: { title: '480px', tag: '標準分享' },
      640: { title: '640px', tag: '高畫質' },
    },
    exportActionBtn: '生成跳舞 GIF',
    exportingText: '正在算幀與編碼 GIF...',
    cancelExportBtn: '取消',
    exportReadyTitle: 'GIF 出爐啦！',
    downloadGifBtn: '下載 GIF',
    shareGifBtn: '分享給朋友',
    fileMeta: (kb, w, h, frames) => `${kb} · ${w}×${h}px · ${frames} 幀無縫循環`,
    errors: {
      invalidFile: '請選擇 PNG、JPG、WebP 或 GIF 圖片檔喔！',
      webglUnsupported: '目前的瀏覽器不支援 WebGL，已切換至相容預覽模式。',
      exportFailed: '生成 GIF 時遇到一點狀況，請試著調小輸出尺寸再試一次。',
    },
  },
  en: {
    brandTitle: 'WiggleMirror',
    brandBadge: '3D Anamorphic Pen Dance',
    brandSubtitle: 'Lay a doodle flat in front of a glossy silver pen tip and watch it stand up and bounce!',
    privacyNote: '100% local real-time raytracing · Zero uploads · No watermark',
    langSwitchLabel: '繁中',
    sourceBarTitle: 'Paper Subject',
    uploadBtn: 'Upload Image',
    pasteHint: 'Drag & drop or Ctrl/Cmd+V to paste',
    doodleToggleOn: 'Live Drawing Active (Hide Pad)',
    doodleToggleOff: 'Doodle Pad (Live Sync)',
    samplePrefix: 'Samples:',
    samples: {
      cat: ':3 Doodle Cat',
      stickman: 'Happy Guy',
      ghost: 'Wavy Ghost',
      starman: 'Cool Shades',
    },
    stageLabel: '3D Mirror Stage',
    stagePlay: 'Play',
    stagePause: 'Pause',
    stageDragHint: 'Drag across the stage to slide the upright silver pen left-right & front-back!',
    stageDropOverlay: 'Drop image onto the notebook to dance!',
    stageCompactTitle: 'Live Reflection Sync',
    stageFinishDoodle: 'Done Drawing',
    cameraViews: {
      full: 'Full Scene',
      closeup: 'Tip Close-Up',
    },
    aspectShort: {
      square: '1:1',
      portrait: '3:4',
    },
    doodleTitle: 'Sketchbook Pad',
    doodleSubtitle: 'Draw upright here—placed upside-down on the desk to stand tall in the cone!',
    doodlePenColors: 'Ink',
    doodleBrushSizes: ['S', 'M', 'L'],
    doodleEraser: 'Eraser',
    doodleUndo: 'Undo',
    doodleClear: 'Clear',
    doodleGuideToggle: 'Cat Guide',
    doodleGuideHint: 'Guide stays hidden from reflection and GIFs',
    presetsTitle: 'Side-to-Side Motion',
    resetDefaultsBtn: 'Reset Sliders',
    presets: {
      parallel: { name: 'Parallel Slide', desc: 'Upright pen gliding left-right & front-back' },
      uhop: { name: 'U-Curve Glide', desc: 'Upright side slide with subtle depth hop' },
      hyper: { name: 'Hyper Side Hop', desc: 'Double-tempo upright parallel bounce' },
      orbit: { name: 'Orbit Glide', desc: 'Upright pen gliding in a smooth oval' },
      paper: { name: 'Paper Slide', desc: 'Fixed pen while sliding the notebook sheet' },
    },
    sliders: {
      speed: 'Move Speed',
      amplitude: 'Left-Right Slide',
      depthAmplitude: 'Front-Back Slide',
      distance: 'Tip Front-Back Position',
      gloss: 'Metallic Gloss',
      scale: 'Doodle Size on Paper',
    },
    propTitle: 'Reflective Prop',
    props: {
      pen: 'Silver Pen Cone',
      cup: 'Steel Cup',
      cone: 'Pure Chrome Cone',
    },
    paperTitle: 'Paper Style',
    papers: {
      lined: 'Lined Notebook',
      grid: 'Grid Paper',
      plain: 'Plain White',
    },
    blendTitle: 'Paper Blending',
    blends: {
      ink: { title: 'Ink on Paper', desc: 'Transparent white so notebook lines show through' },
      sticker: { title: 'Color Sticker', desc: 'Keeps full opaque photo & background colors' },
    },
    inkEnhanceTitle: 'Photo Ink Boost (Remove Paper Gray)',
    inkEnhanceDesc: 'Cleans up dim phone photos of hand drawings into crisp ink lines.',
    exportTitle: 'Export Seamless GIF',
    exportSubtitle: 'Matches live 3D stage framing with phase-locked infinite loop',
    aspectLabel: 'Aspect Ratio',
    aspectSquare: '1:1 Square',
    aspectPortrait: '3:4 Portrait',
    sizeLabel: 'Output Size',
    sizeLabels: {
      256: { title: '256px', tag: 'Sticker' },
      480: { title: '480px', tag: 'Standard' },
      640: { title: '640px', tag: 'High Res' },
    },
    exportActionBtn: 'Mint Dancing GIF',
    exportingText: 'Raytracing frames & encoding GIF...',
    cancelExportBtn: 'Cancel',
    exportReadyTitle: 'Your GIF is Ready!',
    downloadGifBtn: 'Download GIF',
    shareGifBtn: 'Share',
    fileMeta: (kb, w, h, frames) => `${kb} · ${w}×${h}px · ${frames} seamless frames`,
    errors: {
      invalidFile: 'Please select a PNG, JPG, WebP, or GIF image.',
      webglUnsupported: 'WebGL is unavailable in this browser; fallback preview active.',
      exportFailed: 'GIF export failed. Please try a smaller resolution.',
    },
  },
};
