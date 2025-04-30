import { Status } from '../../../common/enums/status.enum';
import { Content } from '../../content/entities/content.entity'; // Importar la entidad Content

// Placeholder para la interfaz ContentDiff
export interface ContentDiff {}

export interface ContentVersion {
  id: string;
  contentId: string;
  content: Content; // Relación con la entidad Content
  contentData: any; // Contenido real de la versión
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  status: Status; // Usar el enum Status importado
  changeType: ChangeType;
  metadata: any; // Metadatos adicionales (autor, etc.) - ahora obligatorio
  validationStatus: any; // Estado de validación (score, etc.) - ahora obligatorio
  createdAt: Date;
  updatedAt: Date;
}

export enum ChangeType {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  DELETION = 'DELETION',
  MERGE = 'MERGE',
  REVERT = 'REVERT',
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Exportar Status como ContentStatus para compatibilidad con el código existente
export { Status as ContentStatus };
