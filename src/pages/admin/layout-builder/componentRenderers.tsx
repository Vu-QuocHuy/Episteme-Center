// import React from 'react';
import {
  HeroConfig,
  FeatureCardsConfig,
  StatisticsConfig,
  CourseCardsConfig,
} from './types';

// ============================================
// HERO SECTION RENDERER
// ============================================
export const renderHeroSection = (config: HeroConfig): string => {
  const heightMap = {
    small: '400px',
    medium: '600px',
    large: '800px',
  };

  const alignmentMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  const height = heightMap[config.height] || '600px';
  const alignment = alignmentMap[config.alignment] || 'center';
  const textAlign = config.alignment;

  const buttons = config.ctaButtons
    .map((btn) => {
      const bgColor = btn.style === 'contained'
        ? (btn.color === 'secondary' ? '#f50057' : '#1976d2')
        : 'transparent';
      const textColor = btn.style === 'contained' ? '#fff' : '#1976d2';
      const border = btn.style === 'outlined' ? '2px solid #1976d2' : 'none';

      return `
        <a
          href="${btn.link}"
          style="
            display: inline-block;
            padding: 12px 32px;
            margin: 8px;
            background-color: ${bgColor};
            color: ${textColor};
            border: ${border};
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: ${btn.style === 'contained' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='${btn.style === 'contained' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'}'"
        >
          ${btn.text}
        </a>
      `;
    })
    .join('');

  const backgroundStyle = config.backgroundImage
    ? `background-image: url('${config.backgroundImage}'); background-size: cover; background-position: center;`
    : `background-color: ${config.backgroundColor || '#f5f5f5'};`;

  const overlay = config.backgroundOverlay
    ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,${config.overlayOpacity || 0.5}); z-index: 1;"></div>`
    : '';

  return `
    <div style="
      position: relative;
      width: 100%;
      min-height: ${height};
      ${backgroundStyle}
      display: flex;
      align-items: center;
      justify-content: ${alignment};
      padding: 40px 20px;
      box-sizing: border-box;
      overflow: hidden;
    ">
      ${overlay}
      <div style="
        position: relative;
        z-index: 2;
        max-width: 1200px;
        width: 100%;
        text-align: ${textAlign};
        color: ${config.textColor || '#fff'};
      ">
        <h1 style="
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 700;
          margin: 0 0 20px 0;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        ">
          ${config.title}
        </h1>
        <p style="
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          margin: 0 0 40px 0;
          line-height: 1.6;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        ">
          ${config.subtitle}
        </p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: ${alignment};">
          ${buttons}
        </div>
      </div>
    </div>
  `;
};

// ============================================
// FEATURE CARDS RENDERER
// ============================================
export const renderFeatureCards = (config: FeatureCardsConfig): string => {
  const columnWidth = {
    2: '50%',
    3: '33.333%',
    4: '25%',
  };

  const cardStyleMap = {
    flat: 'box-shadow: none; border: none;',
    raised: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: none;',
    outlined: 'box-shadow: none; border: 1px solid #e0e0e0;',
  };

  const cardStyle = cardStyleMap[config.cardStyle] || cardStyleMap.raised;

  const cards = config.cards
    .map((card) => {
      const cardContent = card.link
        ? `<a href="${card.link}" style="text-decoration: none; color: inherit; display: block; height: 100%;">${renderCardContent(card, config)}</a>`
        : renderCardContent(card, config);

      return `
        <div style="
          width: 100%;
          max-width: calc(${columnWidth[config.columns]} - 24px);
          min-width: 280px;
          margin: 12px;
          box-sizing: border-box;
          flex: 1 1 280px;
        ">
          <div style="
            ${cardStyle}
            padding: 32px;
            border-radius: 12px;
            background-color: #fff;
            transition: all 0.3s ease;
            height: 100%;
            box-sizing: border-box;
          "
          onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='${config.cardStyle === 'raised' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'}'"
          >
            ${cardContent}
          </div>
        </div>
      `;
    })
    .join('');

  const headerSection = config.title
    ? `
      <div style="text-align: center; margin-bottom: 48px;">
        <h2 style="
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #111;
        ">
          ${config.title}
        </h2>
        ${config.subtitle ? `
          <p style="
            font-size: clamp(1rem, 2vw, 1.25rem);
            color: #666;
            margin: 0;
          ">
            ${config.subtitle}
          </p>
        ` : ''}
      </div>
    `
    : '';

  return `
    <div style="
      width: 100%;
      padding: 60px 20px;
      background-color: ${config.backgroundColor || '#fff'};
      box-sizing: border-box;
    ">
      <div style="max-width: 1200px; margin: 0 auto;">
        ${headerSection}
        <div style="
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: -12px;
        ">
          ${cards}
        </div>
      </div>
    </div>
  `;
};

function renderCardContent(card: any, config: FeatureCardsConfig): string {
  return `
    <div style="text-align: center;">
      <div style="
        font-size: 48px;
        color: ${config.iconColor || '#1976d2'};
        margin-bottom: 20px;
      ">
        <span class="material-icons" style="font-size: inherit;">
          ${card.icon}
        </span>
      </div>
      <h3 style="
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: #111;
      ">
        ${card.title}
      </h3>
      <p style="
        font-size: 1rem;
        line-height: 1.6;
        color: #666;
        margin: 0;
      ">
        ${card.description}
      </p>
    </div>
  `;
}

// ============================================
// STATISTICS COUNTER RENDERER
// ============================================
export const renderStatistics = (config: StatisticsConfig): string => {
  const columnWidth = {
    2: '50%',
    3: '33.333%',
    4: '25%',
  };

  const stats = config.stats
    .map((stat) => {
      return `
        <div style="
          width: 100%;
          max-width: calc(${columnWidth[config.columns]} - 24px);
          min-width: 200px;
          margin: 12px;
          text-align: center;
          box-sizing: border-box;
          flex: 1 1 200px;
        ">
          ${stat.icon ? `
            <div style="
              font-size: 48px;
              color: ${config.textColor || '#fff'};
              margin-bottom: 16px;
              opacity: 0.9;
            ">
              <span class="material-icons" style="font-size: inherit;">
                ${stat.icon}
              </span>
            </div>
          ` : ''}
          <div style="
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 700;
            color: ${config.textColor || '#fff'};
            margin-bottom: 8px;
            line-height: 1;
          ">
            ${stat.number}
          </div>
          <div style="
            font-size: clamp(1rem, 2vw, 1.25rem);
            font-weight: 500;
            color: ${config.textColor || '#fff'};
            opacity: 0.9;
          ">
            ${stat.label}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div style="
      width: 100%;
      padding: 60px 20px;
      background-color: ${config.backgroundColor || '#1976d2'};
      box-sizing: border-box;
    ">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: -12px;
        ">
          ${stats}
        </div>
      </div>
    </div>
  `;
};

// ============================================
// COURSE CARDS RENDERER
// ============================================
export const renderCourseCards = (config: CourseCardsConfig): string => {
  const columnWidth = {
    2: '50%',
    3: '33.333%',
    4: '25%',
  };

  const courses = config.courses
    .map((course) => {
      const priceSection = config.showPrice && course.price
        ? `
          <div style="margin-top: 16px;">
            ${course.originalPrice ? `
              <span style="
                text-decoration: line-through;
                color: #999;
                font-size: 0.9rem;
                margin-right: 8px;
              ">
                ${course.originalPrice}
              </span>
            ` : ''}
            <span style="
              font-size: 1.5rem;
              font-weight: 700;
              color: #1976d2;
            ">
              ${course.price}
            </span>
          </div>
        `
        : '';

      const badge = course.badge
        ? `
          <div style="
            position: absolute;
            top: 16px;
            right: 16px;
            background-color: #f50057;
            color: #fff;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 0.75rem;
            font-weight: 600;
            z-index: 2;
            text-transform: uppercase;
          ">
            ${course.badge}
          </div>
        `
        : '';

      return `
        <div style="
          width: 100%;
          max-width: calc(${columnWidth[config.columns]} - 24px);
          min-width: 280px;
          margin: 12px;
          box-sizing: border-box;
          flex: 1 1 280px;
        ">
          <div style="
            border-radius: 12px;
            overflow: hidden;
            background-color: #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
          "
          onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
          >
            <div style="position: relative; width: 100%; padding-top: 66.67%; overflow: hidden;">
              ${badge}
              <img
                src="${course.image}"
                alt="${course.title}"
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                "
              />
            </div>
            <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
              <h3 style="
                font-size: 1.25rem;
                font-weight: 600;
                margin: 0 0 12px 0;
                color: #111;
              ">
                ${course.title}
              </h3>
              <p style="
                font-size: 0.95rem;
                line-height: 1.6;
                color: #666;
                margin: 0 0 16px 0;
                flex: 1;
              ">
                ${course.description}
              </p>
              ${priceSection}
              <a
                href="${course.ctaLink}"
                style="
                  display: inline-block;
                  width: 100%;
                  padding: 12px 24px;
                  margin-top: 16px;
                  background-color: #1976d2;
                  color: #fff;
                  text-align: center;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  transition: all 0.3s ease;
                  box-sizing: border-box;
                "
                onmouseover="this.style.backgroundColor='#1565c0'"
                onmouseout="this.style.backgroundColor='#1976d2'"
              >
                ${course.ctaText}
              </a>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const headerSection = config.title
    ? `
      <div style="text-align: center; margin-bottom: 48px;">
        <h2 style="
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #111;
        ">
          ${config.title}
        </h2>
        ${config.subtitle ? `
          <p style="
            font-size: clamp(1rem, 2vw, 1.25rem);
            color: #666;
            margin: 0;
          ">
            ${config.subtitle}
          </p>
        ` : ''}
      </div>
    `
    : '';

  return `
    <div style="
      width: 100%;
      padding: 60px 20px;
      background-color: ${config.backgroundColor || '#f9f9f9'};
      box-sizing: border-box;
    ">
      <div style="max-width: 1200px; margin: 0 auto;">
        ${headerSection}
        <div style="
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: -12px;
        ">
          ${courses}
        </div>
      </div>
    </div>
  `;
};
