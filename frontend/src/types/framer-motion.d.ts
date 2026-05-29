declare module 'framer-motion' {
  import { ComponentType, Ref, HTMLAttributes, SVGAttributes } from 'react';

  type MotionProps = HTMLAttributes<HTMLElement> & {
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
    whileInView?: unknown;
    whileFocus?: unknown;
    whileDrag?: unknown;
    transition?: unknown;
    variants?: unknown;
    style?: unknown;
    className?: string;
    layout?: boolean | 'position' | 'size';
    layoutId?: string;
    drag?: boolean | 'x' | 'y';
    dragConstraints?: unknown;
    dragElastic?: number;
    dragMomentum?: boolean;
    onDragStart?: unknown;
    onDragEnd?: unknown;
    onDrag?: unknown;
    onAnimationStart?: unknown;
    onAnimationComplete?: unknown;
    onUpdate?: unknown;
    viewport?: unknown;
    custom?: unknown;
    ref?: Ref<HTMLElement>;
    children?: unknown;
  };

  export const motion: {
    div: ComponentType<MotionProps>;
    span: ComponentType<MotionProps>;
    p: ComponentType<MotionProps>;
    h1: ComponentType<MotionProps>;
    h2: ComponentType<MotionProps>;
    h3: ComponentType<MotionProps>;
    h4: ComponentType<MotionProps>;
    section: ComponentType<MotionProps>;
    main: ComponentType<MotionProps>;
    button: ComponentType<MotionProps & { type?: string; disabled?: boolean; style?: React.CSSProperties; onClick?: () => void; 'aria-label'?: string }>;
    a: ComponentType<MotionProps>;
    img: ComponentType<MotionProps>;
    svg: ComponentType<MotionProps & SVGAttributes<SVGSVGElement>>;
    path: ComponentType<MotionProps & SVGAttributes<SVGPathElement>>;
    circle: ComponentType<MotionProps & SVGAttributes<SVGCircleElement>>;
    g: ComponentType<MotionProps & SVGAttributes<SVGGElement>>;
    rect: ComponentType<MotionProps & SVGAttributes<SVGRectElement>>;
    text: ComponentType<MotionProps & SVGAttributes<SVGTextElement>>;
    line: ComponentType<MotionProps & SVGAttributes<SVGLineElement>>;
    nav: ComponentType<MotionProps>;
    ul: ComponentType<MotionProps>;
    li: ComponentType<MotionProps>;
    footer: ComponentType<MotionProps>;
    header: ComponentType<MotionProps>;
    aside: ComponentType<MotionProps>;
    form: ComponentType<MotionProps>;
    input: ComponentType<MotionProps>;
    label: ComponentType<MotionProps>;
    [key: string]: ComponentType<MotionProps>;
  };

  export function AnimatePresence(props: {
    children?: unknown;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
  }): JSX.Element | null;

  export function useAnimation(): {
    start: (definition: unknown) => Promise<void>;
    set: (definition: unknown) => void;
    stop: () => void;
  };

  export function useMotionValue(initial: number): {
    get: () => number;
    set: (v: number) => void;
  };

  export function useTransform<T>(value: unknown, input: unknown, output: unknown): T;

  export function useInView(ref: Ref<HTMLElement>, options?: unknown): boolean;

  export function useScroll(options?: unknown): {
    scrollX: unknown;
    scrollY: unknown;
    scrollXProgress: unknown;
    scrollYProgress: unknown;
  };

  export function useSpring(value: unknown, config?: unknown): unknown;

  export type Variants = Record<string, unknown>;
  export type Transition = Record<string, unknown>;
  export type HTMLMotionProps<T = HTMLElement> = MotionProps;

  export function isValidMotionProp(key: string): boolean;
}
