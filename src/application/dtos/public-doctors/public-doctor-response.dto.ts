export interface PublicDoctorListItemDto {
  id: string;
  userId: string;
  fullName: string;
  specialtyId: string | null;
  specialtyName: string | null;
  subspecialty: string | null;
  degree: string | null;
  yearsExperience: number | null;
  biography: string | null;
  avatarUrl: string | null;
}

export interface PublicDoctorDetailDto extends PublicDoctorListItemDto {
  specialtyDescription: string | null;
}
