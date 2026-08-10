const checkEligibility = (student, criteria = {}) => {
  const reasons = [];
  const missingRequirements = [];
  let isEligible = true;

  if (criteria.minCgpa && (student.cgpa === undefined || student.cgpa < criteria.minCgpa)) {
    isEligible = false;
    missingRequirements.push(`Minimum CGPA required: ${criteria.minCgpa}`);
    reasons.push(`CGPA ${student.cgpa ?? 'N/A'} is below required ${criteria.minCgpa}`);
  }

  if (criteria.maxBacklogs !== undefined && student.backlogs > criteria.maxBacklogs) {
    isEligible = false;
    missingRequirements.push(`Maximum backlogs allowed: ${criteria.maxBacklogs}`);
    reasons.push(`Has ${student.backlogs} backlogs, max allowed is ${criteria.maxBacklogs}`);
  }

  if (criteria.minTenthPercentage && (student.tenthPercentage === undefined || student.tenthPercentage < criteria.minTenthPercentage)) {
    isEligible = false;
    missingRequirements.push(`Minimum 10th percentage: ${criteria.minTenthPercentage}%`);
    reasons.push(`10th percentage ${student.tenthPercentage ?? 'N/A'}% is below ${criteria.minTenthPercentage}%`);
  }

  if (criteria.minTwelfthPercentage && (student.twelfthPercentage === undefined || student.twelfthPercentage < criteria.minTwelfthPercentage)) {
    isEligible = false;
    missingRequirements.push(`Minimum 12th percentage: ${criteria.minTwelfthPercentage}%`);
    reasons.push(`12th percentage ${student.twelfthPercentage ?? 'N/A'}% is below ${criteria.minTwelfthPercentage}%`);
  }

  if (criteria.allowedBranches?.length && !criteria.allowedBranches.includes(student.branch)) {
    isEligible = false;
    missingRequirements.push(`Allowed branches: ${criteria.allowedBranches.join(', ')}`);
    reasons.push(`Branch '${student.branch}' is not eligible`);
  }

  if (criteria.graduationYears?.length && !criteria.graduationYears.includes(student.graduationYear)) {
    isEligible = false;
    missingRequirements.push(`Allowed graduation years: ${criteria.graduationYears.join(', ')}`);
    reasons.push(`Graduation year ${student.graduationYear} is not eligible`);
  }

  if (criteria.requiredSkills?.length) {
    const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
    const missingSkills = criteria.requiredSkills.filter(
      (skill) => !studentSkills.includes(skill.toLowerCase())
    );
    if (missingSkills.length) {
      isEligible = false;
      missingRequirements.push(`Required skills: ${criteria.requiredSkills.join(', ')}`);
      reasons.push(`Missing skills: ${missingSkills.join(', ')}`);
    }
  }

  if (criteria.customCriteria?.length) {
    criteria.customCriteria.forEach(({ field, operator, value }) => {
      const studentValue = student[field];
      let passed = true;
      switch (operator) {
        case 'gte':
          passed = studentValue >= value;
          break;
        case 'lte':
          passed = studentValue <= value;
          break;
        case 'eq':
          passed = studentValue === value;
          break;
        case 'in':
          passed = Array.isArray(value) && value.includes(studentValue);
          break;
        default:
          break;
      }
      if (!passed) {
        isEligible = false;
        missingRequirements.push(`Custom: ${field} ${operator} ${value}`);
        reasons.push(`Does not meet custom criteria: ${field}`);
      }
    });
  }

  if (isEligible) {
    reasons.push('Student meets all eligibility criteria');
  }

  return { isEligible, reasons, missingRequirements };
};

module.exports = { checkEligibility };
