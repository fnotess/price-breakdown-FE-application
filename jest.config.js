const qCenterIntegrator = require.resolve('jest-qcenter-integrator');

module.exports = {
  name: 'cloud-pci-frontend',
  verbose: true,
  collectCoverageFrom: [
    'src/containers/PriceValidation/PricingHelper.js',
    'src/utils/**'
  ],
  transform: {
    '\\.js$': '<rootDir>/node_modules/babel-jest',
  },
  reporters: ['default',
    [qCenterIntegrator,
      {
        release: process.env.QC_BUILD || 'CloudPCI_REG_BUILD',
        project: 'Cloud PCI',
        env: process.env.QC_ENV || 'EXE',
        module: 'CLOUD_PCI_UNIT',
        feature: 'UNIT_TESTS_FE',
        updateDashboard: (process.env.QC_SUBMIT && process.env.QC_SUBMIT === 'true') || false,
      },
    ],
  ],
};
