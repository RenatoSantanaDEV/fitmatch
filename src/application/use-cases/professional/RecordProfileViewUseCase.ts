import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IProfileViewRepository } from '../../ports/output/IProfileViewRepository';

export interface RecordProfileViewInput {
  profileOwnerUserId: string;
  viewerUserId: string;
}

/**
 * Fire-and-forget side effect triggered from the profile page — never throws,
 * so a tracking failure never breaks the page it's attached to.
 */
export class RecordProfileViewUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly profileViewRepo: IProfileViewRepository,
  ) {}

  async execute(input: RecordProfileViewInput): Promise<void> {
    if (input.profileOwnerUserId === input.viewerUserId) return;

    const professional = await this.professionalRepo.findByUserId(input.profileOwnerUserId);
    if (!professional) return;

    await this.profileViewRepo.recordView({
      professionalId: professional.id,
      viewerUserId: input.viewerUserId,
    });
  }
}
