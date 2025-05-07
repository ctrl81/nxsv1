/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// Add type declarations for your UI components
declare module '@/components/ui/*' {
  const component: React.ComponentType<any>;
  export default component;
}

// Add type declarations for your hooks
declare module '@/hooks/*' {
  const hook: any;
  export default hook;
}

// Add type declarations for your utils
declare module '@/utils/*' {
  const util: any;
  export default util;
} 