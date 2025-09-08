export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ContentItem {
  i: string;
  type: 'text' | 'image' | 'input';
  content: string;
}

export const DESIGN_WIDTH = 1200;

export const generateResponsiveHTML = (
  layoutItems: LayoutItem[],
  contentItems: ContentItem[],
  opts: { background: string; borderRadius: number }
): string => {
  let maxBottom = 0;
  const layoutHTML = (layoutItems || []).map((layoutItem) => {
    const item = contentItems.find((i) => i.i === layoutItem.i);
    if (!item) return '';

    const xPercent = (layoutItem.x * 30 / DESIGN_WIDTH) * 100;
    const yPercent = (layoutItem.y * 30 / DESIGN_WIDTH) * 100;
    const widthPercent = (layoutItem.w * 30 / DESIGN_WIDTH) * 100;
    const heightVh = Math.max((layoutItem.h * 30 / window.innerHeight) * 100, 5);

    const bottom = yPercent + heightVh;
    if (bottom > maxBottom) maxBottom = bottom;

    let contentHTML = '';
    switch (item.type) {
      case 'text':
        contentHTML = `<div style="font-size: clamp(0.9rem, 1vw, 1rem); line-height: 1.6;">${item.content || 'Default Text'}</div>`;
        break;
      case 'input':
        contentHTML = `<input type="text" value="${item.content || ''}" readonly style="width: 100%; padding: clamp(8px, 1.5vw, 16px); border: 1px solid #ddd; border-radius: 4px; font-size: clamp(0.9rem, 2vw, 1.2rem);" />`;
        break;
      case 'image':
        contentHTML = `<img src="${item.content}" alt="Uploaded Image" style="width: 100%; height: 100%; object-fit: cover;" />`;
        break;
      default:
        contentHTML = `<div>Invalid Type</div>`;
    }

    return `
      <div
        style="
          position: absolute;
          left: ${xPercent}%;
          top: ${yPercent}%;
          width: ${widthPercent}%;
          height: ${heightVh}vh;
          box-sizing: border-box;
          padding: clamp(10px, 1.5vw, 20px);
        "
      >
        ${contentHTML}
      </div>`;
  });

  return `
    <div
      style="
        position: relative;
        width: 100%;
        min-height: 100vh;
        height: ${Math.max(maxBottom, 100)}vh;
        box-sizing: border-box;
        background-color: ${opts.background};
        border-radius: ${opts.borderRadius}px;
        margin: 0;
        padding: clamp(20px, 3vw, 40px);
      "
    >
      ${layoutHTML.join('\n')}
    </div>
  `;
};

export const parseHTMLContent = (htmlContent: string): { items: ContentItem[]; layouts: LayoutItem[] } => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const items: ContentItem[] = [];
  const layouts: LayoutItem[] = [];
  let itemIndex = 0;

  const absoluteDivs = tempDiv.querySelectorAll('div[style*="position: absolute"]');
  absoluteDivs.forEach((div) => {
    const style = div.getAttribute('style') || '';
    const transformMatch = style.match(/transform:\s*translate\(([^,]+)px,\s*([^)]+)px\)/);
    const widthMatch = style.match(/width:\s*([^;]+)px/);
    const heightMatch = style.match(/height:\s*([^;]+)px/);
    if (transformMatch && widthMatch && heightMatch) {
      const x = parseInt(transformMatch[1]) || 0;
      const y = parseInt(transformMatch[2]) || 0;
      const width = parseInt(widthMatch[1]) || 200;
      const height = parseInt(heightMatch[1]) || 100;

      const gridX = Math.round(x / 30);
      const gridY = Math.round(y / 30);
      const gridW = Math.round(width / 30);
      const gridH = Math.round(height / 30);

      const itemId = `item-${itemIndex++}`;

      let contentType: 'text' | 'image' | 'input' = 'text';
      let content = '';
      const img = div.querySelector('img');
      if (img) {
        contentType = 'image';
        content = (img as HTMLImageElement).src || '';
      } else {
        const input = div.querySelector('input');
        if (input) {
          contentType = 'input';
          content = (input as HTMLInputElement).value || '';
        } else {
          contentType = 'text';
          content = div.innerHTML || '<p>Default Text</p>';
        }
      }

      items.push({ i: itemId, type: contentType, content });
      layouts.push({ i: itemId, x: gridX, y: gridY, w: gridW, h: gridH });
    }
  });

  return { items, layouts };
};
