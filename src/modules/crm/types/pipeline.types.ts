// NexoCore — CRM Type Definitions
// Shared types for CRM UI components

export interface DealPipe {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  contact: {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
  };
  assignedTo: string | null;
  expectedCloseAt: Date | null;
  wonAt: Date | null;
  lostAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStagePipe {
  id: string;
  name: string;
  position: number;
  color: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  isClosed: boolean;
}

export interface PipelineSummary {
  totalDeals: number;
  totalValue: number;
  wonValue: number;
  activeDeals: number;
}
