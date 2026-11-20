export interface Photo {
  url: string | null;
  publicId?: string | null;
}

export interface TopStudent {
  _id: string;
  name: string;
  mark: string;
  grade: string;
  label: string;
  photo?: Photo;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

export type PublicTopStudent = Pick<TopStudent, '_id' | 'name' | 'mark' | 'grade' | 'label' | 'photo'>;

export interface AppRelease {
  _id: string;
  version: string;
  downloadUrl: string;
  notes: string;
  sizeMb: number | null;
  isActive: boolean;
  createdAt: string;
}

export type PublicAppRelease = Pick<
  AppRelease,
  '_id' | 'version' | 'downloadUrl' | 'notes' | 'sizeMb' | 'createdAt'
>;