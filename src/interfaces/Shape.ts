export interface Shape {
  
        type: string;
        x: number;
        y: number;
        size?: number;
        width?: number;
        height?: number;
        radius?: number;
        color?: string;
        lineWidth?: number;
      
  }
  
  export interface ShapesData {
    shapes: Shape[];
  }
  