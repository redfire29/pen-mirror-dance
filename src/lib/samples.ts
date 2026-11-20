import type { SampleDoodleMeta } from '../types/studio';

export type SampleId = SampleDoodleMeta['id'];

const SAMPLE_IDS: SampleId[] = ['cat', 'stickman', 'ghost', 'starman'];

function drawStroke(
  ctx: CanvasRenderingContext2D,
  fn: () => void,
  color = '#1B1D24',
  width = 16
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  fn();
  ctx.stroke();
  ctx.restore();
}

export function drawSampleToCanvas(
  ctx: CanvasRenderingContext2D,
  id: SampleId,
  size: number
) {
  ctx.clearRect(0, 0, size, size);
  const s = size / 512;
  ctx.save();
  ctx.scale(s, s);

  if (id === 'cat') {
    const ink = '#191B22';

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(194, 152);
    ctx.lineTo(156, 86);
    ctx.lineTo(146, 178);
    ctx.quadraticCurveTo(106, 212, 128, 258);
    ctx.quadraticCurveTo(88, 286, 120, 314);
    ctx.quadraticCurveTo(144, 320, 166, 300);
    ctx.quadraticCurveTo(164, 370, 176, 412);
    ctx.quadraticCurveTo(192, 434, 214, 418);
    ctx.quadraticCurveTo(234, 396, 256, 398);
    ctx.quadraticCurveTo(278, 396, 298, 418);
    ctx.quadraticCurveTo(320, 434, 336, 412);
    ctx.quadraticCurveTo(348, 370, 346, 300);
    ctx.quadraticCurveTo(368, 320, 392, 314);
    ctx.quadraticCurveTo(424, 286, 384, 258);
    ctx.quadraticCurveTo(406, 212, 366, 178);
    ctx.lineTo(356, 86);
    ctx.lineTo(318, 152);
    ctx.quadraticCurveTo(256, 136, 194, 152);
    ctx.closePath();
    ctx.fill();

    drawStroke(
      ctx,
      () => {
        ctx.moveTo(342, 374);
        ctx.quadraticCurveTo(420, 386, 412, 326);
        ctx.quadraticCurveTo(404, 310, 382, 338);
      },
      ink,
      14
    );

    drawStroke(
      ctx,
      () => {
        ctx.moveTo(194, 152);
        ctx.lineTo(156, 86);
        ctx.lineTo(146, 178);
        ctx.quadraticCurveTo(106, 212, 128, 258);
        ctx.quadraticCurveTo(88, 286, 120, 314);
        ctx.quadraticCurveTo(144, 320, 166, 300);
        ctx.quadraticCurveTo(164, 370, 176, 412);
        ctx.quadraticCurveTo(192, 434, 214, 418);
        ctx.quadraticCurveTo(234, 396, 256, 398);
        ctx.quadraticCurveTo(278, 396, 298, 418);
        ctx.quadraticCurveTo(320, 434, 336, 412);
        ctx.quadraticCurveTo(348, 370, 346, 300);
        ctx.quadraticCurveTo(368, 320, 392, 314);
        ctx.quadraticCurveTo(424, 286, 384, 258);
        ctx.quadraticCurveTo(406, 212, 366, 178);
        ctx.lineTo(356, 86);
        ctx.lineTo(318, 152);
        ctx.quadraticCurveTo(256, 136, 194, 152);
      },
      ink,
      16
    );

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(198, 218, 11, 0, Math.PI * 2);
    ctx.arc(314, 218, 11, 0, Math.PI * 2);
    ctx.fill();

    drawStroke(
      ctx,
      () => {
        ctx.moveTo(222, 232);
        ctx.quadraticCurveTo(239, 254, 256, 228);
        ctx.quadraticCurveTo(273, 254, 290, 232);
      },
      ink,
      12
    );

    drawStroke(
      ctx,
      () => {
        ctx.moveTo(120, 206);
        ctx.lineTo(84, 198);
        ctx.moveTo(118, 226);
        ctx.lineTo(78, 228);
        ctx.moveTo(124, 244);
        ctx.lineTo(88, 256);

        ctx.moveTo(392, 206);
        ctx.lineTo(428, 198);
        ctx.moveTo(394, 226);
        ctx.lineTo(434, 228);
        ctx.moveTo(388, 244);
        ctx.lineTo(424, 256);
      },
      ink,
      10
    );
  } else if (id === 'stickman') {
    ctx.fillStyle = '#FFE14D';
    ctx.beginPath();
    ctx.arc(256, 134, 54, 0, Math.PI * 2);
    ctx.fill();

    drawStroke(ctx, () => {
      ctx.arc(256, 134, 54, 0, Math.PI * 2);
    });

    ctx.fillStyle = '#1B1D24';
    ctx.beginPath();
    ctx.arc(236, 126, 7.5, 0, Math.PI * 2);
    ctx.arc(278, 126, 7.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF5C39';
    ctx.beginPath();
    ctx.ellipse(220, 144, 10, 6.5, 0, 0, Math.PI * 2);
    ctx.ellipse(292, 144, 10, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    drawStroke(
      ctx,
      () => {
        ctx.arc(256, 142, 20, 0.18 * Math.PI, 0.82 * Math.PI);
      },
      '#1B1D24',
      11
    );

    drawStroke(ctx, () => {
      ctx.moveTo(256, 188);
      ctx.quadraticCurveTo(246, 265, 256, 332);
    });

    drawStroke(ctx, () => {
      ctx.moveTo(254, 224);
      ctx.quadraticCurveTo(186, 226, 140, 150);
    });
    drawStroke(ctx, () => {
      ctx.moveTo(254, 224);
      ctx.quadraticCurveTo(326, 212, 372, 146);
    });

    ctx.fillStyle = '#FF5C39';
    ctx.beginPath();
    ctx.arc(136, 145, 14, 0, Math.PI * 2);
    ctx.arc(375, 141, 14, 0, Math.PI * 2);
    ctx.fill();

    drawStroke(ctx, () => {
      ctx.moveTo(256, 332);
      ctx.quadraticCurveTo(212, 386, 182, 434);
      ctx.lineTo(154, 434);
    });
    drawStroke(ctx, () => {
      ctx.moveTo(256, 332);
      ctx.quadraticCurveTo(304, 382, 332, 432);
      ctx.lineTo(360, 428);
    });
  } else if (id === 'ghost') {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(154, 398);
    ctx.quadraticCurveTo(152, 102, 256, 102);
    ctx.quadraticCurveTo(360, 102, 358, 398);
    ctx.quadraticCurveTo(324, 428, 290, 394);
    ctx.quadraticCurveTo(256, 430, 222, 394);
    ctx.quadraticCurveTo(188, 428, 154, 398);
    ctx.closePath();
    ctx.fill();

    drawStroke(ctx, () => {
      ctx.moveTo(154, 398);
      ctx.quadraticCurveTo(152, 102, 256, 102);
      ctx.quadraticCurveTo(360, 102, 358, 398);
      ctx.quadraticCurveTo(324, 428, 290, 394);
      ctx.quadraticCurveTo(256, 430, 222, 394);
      ctx.quadraticCurveTo(188, 428, 154, 398);
    });

    drawStroke(ctx, () => {
      ctx.moveTo(160, 254);
      ctx.quadraticCurveTo(112, 240, 114, 198);
      ctx.moveTo(352, 254);
      ctx.quadraticCurveTo(400, 240, 398, 198);
    });

    ctx.fillStyle = '#1B1D24';
    ctx.beginPath();
    ctx.ellipse(222, 212, 12, 17, 0, 0, Math.PI * 2);
    ctx.ellipse(290, 212, 12, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF8FA3';
    ctx.beginPath();
    ctx.ellipse(194, 240, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(318, 240, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF5C39';
    ctx.beginPath();
    ctx.ellipse(256, 252, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    drawStroke(
      ctx,
      () => {
        ctx.ellipse(256, 252, 14, 18, 0, 0, Math.PI * 2);
      },
      '#1B1D24',
      8
    );
  } else {
    ctx.fillStyle = '#FFE14D';
    ctx.beginPath();
    ctx.arc(256, 134, 54, 0, Math.PI * 2);
    ctx.fill();
    drawStroke(ctx, () => {
      ctx.arc(256, 134, 54, 0, Math.PI * 2);
    });

    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.roundRect(198, 108, 52, 30, 8);
    ctx.roundRect(262, 108, 52, 30, 8);
    ctx.fill();
    drawStroke(
      ctx,
      () => {
        ctx.roundRect(198, 108, 52, 30, 8);
        ctx.roundRect(262, 108, 52, 30, 8);
        ctx.moveTo(250, 120);
        ctx.lineTo(262, 120);
      },
      '#1B1D24',
      8
    );

    drawStroke(
      ctx,
      () => {
        ctx.moveTo(234, 158);
        ctx.quadraticCurveTo(262, 172, 286, 152);
      },
      '#1B1D24',
      9
    );

    drawStroke(ctx, () => {
      ctx.moveTo(256, 190);
      ctx.lineTo(256, 336);
    });
    drawStroke(
      ctx,
      () => {
        ctx.moveTo(256, 232);
        ctx.lineTo(168, 250);
        ctx.lineTo(146, 174);
        ctx.moveTo(256, 232);
        ctx.lineTo(344, 210);
        ctx.lineTo(372, 138);
      },
      '#1B1D24',
      15
    );
    drawStroke(
      ctx,
      () => {
        ctx.moveTo(372, 138);
        ctx.lineTo(360, 104);
        ctx.moveTo(372, 138);
        ctx.lineTo(392, 108);
      },
      '#FF5C39',
      10
    );

    drawStroke(ctx, () => {
      ctx.moveTo(256, 336);
      ctx.lineTo(192, 424);
      ctx.lineTo(164, 424);
      ctx.moveTo(256, 336);
      ctx.lineTo(318, 424);
      ctx.lineTo(348, 424);
    });
  }

  ctx.restore();
}

export function createSampleCanvas(id: SampleId, size = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawSampleToCanvas(ctx, id, size);
  }
  return canvas;
}

export function generateAllSampleMetas(): SampleDoodleMeta[] {
  return SAMPLE_IDS.map((id) => {
    const thumbCanvas = createSampleCanvas(id, 128);
    return {
      id,
      thumbDataUrl: thumbCanvas.toDataURL('image/png'),
    };
  });
}
