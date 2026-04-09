// NBFC Keyword Intelligence Engine
// Scans title + description for NBFC-related keywords and returns tag arrays

const KEYWORD_GROUPS = {
  GENERAL_NBFC: {
    label: 'NBFC',
    color: 'nbfc-orange',
    bgColor: 'bg-nbfc-orange-light',
    textColor: 'text-nbfc-orange',
    borderColor: 'border-nbfc-orange',
    keywords: [
      'nbfc', 'non-banking financial', 'non banking financial',
      'scale based regulation', 'sbr', 'nbfc-mfi', 'nbfc mfi',
      'microfinance institution', 'nbfc-ifc', 'nbfc-nd',
      'upper layer', 'middle layer', 'base layer',
      'deposit taking nbfc', 'public deposit',
      'nbfc-p2p', 'nbfc-aa', 'account aggregator',
      'housing finance', 'hfc', 'nbfc-factor',
      'systemically important nbfc', 'nd-si',
    ],
  },
  ICAAP: {
    label: 'ICAAP',
    color: 'icaap-blue',
    bgColor: 'bg-icaap-blue-light',
    textColor: 'text-icaap-blue',
    borderColor: 'border-icaap-blue',
    keywords: [
      'icaap', 'internal capital adequacy assessment', 'pillar 2', 'srep',
      'capital planning', 'stress testing', 'internal capital',
    ],
  },
  ECL: {
    label: 'ECL',
    color: 'ecl-green',
    bgColor: 'bg-ecl-green-light',
    textColor: 'text-ecl-green',
    borderColor: 'border-ecl-green',
    keywords: [
      'ecl', 'expected credit loss', 'ind as 109', 'ifrs 9', 'impairment',
      'loss provisioning', 'stage 1', 'stage 2', 'stage 3',
      'forward-looking provision',
    ],
  },
  IRACP: {
    label: 'IRACP',
    color: 'iracp-purple',
    bgColor: 'bg-iracp-purple-light',
    textColor: 'text-iracp-purple',
    borderColor: 'border-iracp-purple',
    keywords: [
      'iracp', 'irac', 'income recognition', 'asset classification',
      'npa norms', 'asset quality', 'special mention account',
      'sma', 'sma-0', 'sma-1', 'sma-2',
      'sub-standard', 'doubtful', 'loss asset',
      'npa', 'non-performing asset',
      'overdue', 'days past due', 'dpd', 'upgrade of npa',
    ],
  },
  CAPITAL_ADEQUACY: {
    label: 'Capital',
    color: 'capital-teal',
    bgColor: 'bg-capital-teal-light',
    textColor: 'text-capital-teal',
    borderColor: 'border-capital-teal',
    keywords: [
      'capital adequacy', 'crar', 'tier 1', 'tier 2',
      'risk weighted asset', 'rwa', 'leverage ratio',
      'capital conservation buffer', 'regulatory capital',
      'minimum capital', 'capital requirement',
    ],
  },
  PROVISIONING: {
    label: 'Provisioning',
    color: 'provision-red',
    bgColor: 'bg-provision-red-light',
    textColor: 'text-provision-red',
    borderColor: 'border-provision-red',
    keywords: [
      'provision', 'provisioning', 'loan loss', 'write-off', 'write off',
      'contingent provision', 'standard asset provision', 'npa provision',
      'one time settlement', 'ots', 'resolution framework', 'stressed asset',
    ],
  },
  LIQUIDITY: {
    label: 'Liquidity',
    color: 'liquidity-cyan',
    bgColor: 'bg-liquidity-cyan-light',
    textColor: 'text-liquidity-cyan',
    borderColor: 'border-liquidity-cyan',
    keywords: [
      'liquidity risk', 'lcr', 'liquidity coverage ratio', 'nsfr',
      'net stable funding', 'alm', 'asset liability management',
      'liquidity management',
    ],
  },
  GOVERNANCE: {
    label: 'Governance',
    color: 'governance-amber',
    bgColor: 'bg-governance-amber-light',
    textColor: 'text-governance-amber',
    borderColor: 'border-governance-amber',
    keywords: [
      'corporate governance', 'board of directors', 'fit and proper',
      'risk management committee', 'audit committee', 'internal audit',
      'compliance function', 'key managerial personnel', 'kmp',
    ],
  },
};

/**
 * Scans title + description for NBFC-related keywords.
 * Returns an object with:
 *   - tags: array of { groupKey, label, color, bgColor, textColor, borderColor }
 *   - isNBFCRelevant: boolean
 *   - isGeneralNBFC: boolean (matched GENERAL_NBFC keywords directly)
 */
export function tagItem(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const matchedGroups = [];

  for (const [groupKey, group] of Object.entries(KEYWORD_GROUPS)) {
    const matched = group.keywords.some((keyword) => text.includes(keyword));
    if (matched) {
      matchedGroups.push({
        groupKey,
        label: group.label,
        color: group.color,
        bgColor: group.bgColor,
        textColor: group.textColor,
        borderColor: group.borderColor,
      });
    }
  }

  const isGeneralNBFC = matchedGroups.some((g) => g.groupKey === 'GENERAL_NBFC');
  const subTopicCount = matchedGroups.filter((g) => g.groupKey !== 'GENERAL_NBFC').length;

  // Item is "NBFC-relevant" if it matches GENERAL_NBFC OR any 2+ sub-topic groups
  const isNBFCRelevant = isGeneralNBFC || subTopicCount >= 2;

  return {
    tags: matchedGroups,
    isNBFCRelevant,
    isGeneralNBFC,
  };
}

export { KEYWORD_GROUPS };
export default tagItem;
