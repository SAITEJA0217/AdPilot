import { prisma } from './prisma';

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    // @ts-ignore: Prisma types are out of sync until server restart
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (setting) return setting.value;
    
    // Create it with default if it doesn't exist
    // @ts-ignore: Prisma types are out of sync until server restart
    await prisma.systemSetting.create({
      data: { key, value: defaultValue }
    });
    return defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

export type AccessState = {
  isLaunchActive: boolean;
  isTrialActive: boolean;
  isPaid: boolean;
  hasFullAccess: boolean;
  trialEndsAt: Date | null;
  launchEndsAt: Date | null;
};

export async function checkAccess(auditId: string): Promise<AccessState> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { user: true }
  });

  if (!audit) {
    throw new Error('Audit not found');
  }

  const now = new Date();

  // Settings
  const launchEndDateStr = await getSystemSetting('LAUNCH_END_DATE', new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()); // Default 10 days from now
  const launchEndsAt = new Date(launchEndDateStr);
  const isLaunchActive = now < launchEndsAt;

  // @ts-ignore
  const isPaid = audit.paymentStatus === 'paid';

  let isTrialActive = false;
  // @ts-ignore
  if (audit.user.trialEndsAt) {
    // @ts-ignore
    isTrialActive = now < new Date(audit.user.trialEndsAt);
  }

  const hasFullAccess = isLaunchActive || isTrialActive || isPaid;

  return {
    isLaunchActive,
    isTrialActive,
    isPaid,
    hasFullAccess,
    // @ts-ignore
    trialEndsAt: audit.user.trialEndsAt ? new Date(audit.user.trialEndsAt) : null,
    launchEndsAt,
  };
}
