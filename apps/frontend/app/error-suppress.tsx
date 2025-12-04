"use client";

import { useEffect } from 'react';

export function ErrorSuppress() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const suppressNextjsOverlay = () => {
        const selectors = [
          '[data-nextjs-dialog]',
          '[data-nextjs-toast]',
          '#__next-build-watcher',
          '[id*="nextjs"]',
          '[class*="nextjs"]',
          '[class*="__nextjs"]',
          'iframe[src*="nextjs"]',
          'iframe[src*="__nextjs"]',
        ];

        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              (el as HTMLElement).style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: fixed !important; z-index: -9999 !important; width: 0 !important; height: 0 !important;';
              el.remove();
            });
          } catch (e) {}
        });

        document.querySelectorAll('div, span, p').forEach(el => {
          const text = el.textContent || '';
          if (
            text.includes('issues') ||
            text.includes('Issues') ||
            text.includes('Error:') ||
            text.includes('Warning:') ||
            text.match(/\d+\s+issues?/i)
          ) {
            let current: Element | null = el;
            while (current && current !== document.body) {
              const hasNextjs = 
                current.getAttribute('data-nextjs-dialog') !== null ||
                current.getAttribute('data-nextjs-toast') !== null ||
                current.id?.includes('nextjs') ||
                current.className?.toString().includes('nextjs');
              
              if (hasNextjs) {
                (current as HTMLElement).style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: fixed !important; z-index: -9999 !important; width: 0 !important; height: 0 !important;';
                current.remove();
                break;
              }
              current = current.parentElement;
            }
          }
        });
      };

      const observer = new MutationObserver(() => {
        suppressNextjsOverlay();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id'],
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      const interval = setInterval(suppressNextjsOverlay, 100);

      suppressNextjsOverlay();

      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args: any[]) => {
        const errorString = args.join(' ');
        if (
          errorString.includes('Warning:') ||
          errorString.includes('React') ||
          errorString.includes('hydration') ||
          errorString.includes('Hydration') ||
          errorString.includes('Unhandled Runtime Error') ||
          errorString.includes('issues')
        ) {
          suppressNextjsOverlay();
          return;
        }
        originalError.apply(console, args);
      };

      console.warn = (...args: any[]) => {
        const warnString = args.join(' ');
        if (
          warnString.includes('Warning:') ||
          warnString.includes('React') ||
          warnString.includes('hydration') ||
          warnString.includes('Hydration') ||
          warnString.includes('issues')
        ) {
          suppressNextjsOverlay();
          return;
        }
        originalWarn.apply(console, args);
      };

      window.addEventListener('error', (event) => {
        suppressNextjsOverlay();
        event.preventDefault();
        event.stopPropagation();
        return false;
      }, true);

      window.addEventListener('unhandledrejection', (event) => {
        suppressNextjsOverlay();
        event.preventDefault();
        return false;
      }, true);

      return () => {
        clearInterval(interval);
        console.error = originalError;
        console.warn = originalWarn;
        observer.disconnect();
      };
    }
  }, []);

  return null;
}

