export const determineUserStatus = (educations) => {
    if (!educations || educations.length === 0) return "-";

    const now = new Date();
    let isStudent = false;

    for (let edu of educations) {
        let gradYear = 0;

        // 1. Try to use End Date
        if (edu.enddate) {
            const d = new Date(edu.enddate);
            if (!isNaN(d.getTime())) gradYear = d.getFullYear();
        } 
        // 2. Try to use Join Date + Duration
        else if (edu.joindate && edu.course) {
            const s = new Date(edu.joindate);
            if (!isNaN(s.getTime())) {
                const startYear = s.getFullYear();
                const courseName = (edu.course || "").toLowerCase();
                let duration = 0;
                
                if (courseName.includes('b.tech') || courseName.includes('btech') || courseName.includes('bachelor')) {
                    duration = 4;
                } else if (courseName.includes('m.tech') || courseName.includes('mtech') || courseName.includes('master')) {
                    duration = 2;
                } else {
                    duration = 4; // Default fallback
                }
                gradYear = startYear + duration;
            }
        }

        if (gradYear > 0) {
            const cutoffDate = new Date(gradYear, 4, 15); // May 15th
            if (now <= cutoffDate) {
                isStudent = true;
                break; 
            }
        }
    }

    return isStudent ? "Student" : "Alumni";
};

export const checkAlumniStatus = (educations) => {
    return determineUserStatus(educations) === "Alumni";
};

export const getLatestEducation = (educations) => {
    if (!educations || educations.length === 0) return { course: "", year: "" };
    const sorted = educations.sort((a, b) => {
        const dateA = new Date(a.enddate || "1900-01-01");
        const dateB = new Date(b.enddate || "1900-01-01");
        return dateB - dateA;
    });
    const latest = sorted[0];
    const year = latest.enddate ? new Date(latest.enddate).getFullYear() : "";
    return { course: latest.course, year: year.toString() };
};

export const createFlexibleRegex = (text) => {
    if (!text) return null;
    const clean = text.replace(/[\W_]+/g, "");
    const pattern = clean.split('').join('[\\W_]*');
    return new RegExp(pattern, "i");
};
