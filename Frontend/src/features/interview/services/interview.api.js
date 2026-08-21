import axios from "axios";

const BASE_URL = "http://localhost:3000/api/interview";

export const getAllInterviewReports = async () => {
  const res = await axios.get(BASE_URL, {
    withCredentials: true,
  });
  return res.data;
};

export const getInterviewReportById = async (id) => {
  const response = await axios.get(`http://localhost:3000/api/interview/report/${id}`, {
    withCredentials: true
  });
  return response.data;
};

export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();

  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  formData.append("resume", resumeFile);

  const res = await axios.post(BASE_URL, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
export const generateResumePdf = async ({ interviewReportId }) => {
  const res = await axios.get(
    `${BASE_URL}/resume/${interviewReportId}`,
    {
      withCredentials: true,
      responseType: "blob",
    }
  )

  return res.data
}