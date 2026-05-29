/**
 * Type declarations for third-party modules without type definitions
 */

declare module 'html2canvas' {
  function html2canvas(
    element: HTMLElement,
    options?: {
      allowTaint?: boolean;
      useCORS?: boolean;
      width?: number;
      height?: number;
      backgroundColor?: string | null;
      scale?: number;
      logging?: boolean;
      [key: string]: unknown;
    },
  ): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'recharts' {
  // Minimal declarations for recharts components used in the project
  import { ComponentType, ReactNode } from 'react';

  interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: ReactNode;
    [key: string]: unknown;
  }
  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;

  interface LineChartProps {
    data?: unknown[];
    children?: ReactNode;
    [key: string]: unknown;
  }
  export const LineChart: ComponentType<LineChartProps>;

  interface LineProps {
    type?: string;
    dataKey?: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: unknown;
    activeDot?: unknown;
    name?: string;
    [key: string]: unknown;
  }
  export const Line: ComponentType<LineProps>;

  interface XAxisProps {
    dataKey?: string;
    [key: string]: unknown;
  }
  export const XAxis: ComponentType<XAxisProps>;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface YAxisProps extends Record<string, unknown> {}
  export const YAxis: ComponentType<YAxisProps>;

  interface CartesianGridProps {
    strokeDasharray?: string;
    [key: string]: unknown;
  }
  export const CartesianGrid: ComponentType<CartesianGridProps>;

  interface TooltipProps {
    content?: ComponentType | ReactNode;
    [key: string]: unknown;
  }
  export const Tooltip: ComponentType<TooltipProps>;

  interface ReferenceLineProps {
    y?: string | number;
    stroke?: string;
    strokeDasharray?: string;
    label?: unknown;
    [key: string]: unknown;
  }
  export const ReferenceLine: ComponentType<ReferenceLineProps>;

  export interface DotProps {
    cx?: number;
    cy?: number;
    r?: number;
    payload?: unknown;
    [key: string]: unknown;
  }
}
