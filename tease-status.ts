import { Script } from "vm";

export interface TeaseStatus {
  metadata: TeaseMetadata;
  totalFiles: number;
  downloadedFiles: number;
  errors: string[];
}

export interface TeaseMetadata {
  id: string;
  title: string;
  author: string;
  authorId: string;
}
