export default class LicenseDTO {
  tenantId: string;
  numberOfUsers: number;
  totalLicenses: number;
  usedLicenses: number;

  constructor() {
    this.tenantId = '';
    this.numberOfUsers = 0;
    this.totalLicenses = 0;
    this.usedLicenses = 0;
  }
}
