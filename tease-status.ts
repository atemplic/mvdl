import { Script } from "vm";

export interface TeaseStatus {
  metadata?: TeaseMetadata;
  script?: TeaseScript;
}

export interface TeaseMetadata {
  id?: string;
  title?: string;
  author?: string;
  authorId?: string;
}

export interface TeaseScript {
  scriptText: string;
  images: Image[];
}

export interface Image {
  id: string;
  hash: string;
  galleryId: string;
  galleryName: string;
  downloaded: boolean;
}
