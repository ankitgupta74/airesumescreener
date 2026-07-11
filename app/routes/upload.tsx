import React, { useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdfToImage";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

function upload() {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
    }) => {
    setIsProcessing(true);
    setStatusText("Uploading the file...");
    const uploadedFileRes: any = await fs.upload([file]);
    if (!uploadedFileRes) return setStatusText("Error: Failed to upload file");
    const actualFile = Array.isArray(uploadedFileRes)
      ? uploadedFileRes[0]
      : uploadedFileRes;

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);

    if (!imageFile.file)
      return setStatusText(
        imageFile.error || "Error: Failed to convert PDF to Image",
      );

    setStatusText("Uploading the image...");
    const uploadedImageRes: any = await fs.upload([imageFile.file]);
    if (!uploadedImageRes)
      return setStatusText("Error: Failed to upload Image");
    const actualImg = Array.isArray(uploadedImageRes)
      ? uploadedImageRes[0]
      : uploadedImageRes;

    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data: any = {
      id: uuid,
      resumePath: actualFile.path,
      imagePath: actualImg.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText('Analyzing...');

    try {
      // 1. Pass the exact image path
      const feedback = await ai.feedback(
        actualImg.path,
        prepareInstructions({ jobTitle, jobDescription }),
      );

      if (!feedback) return setStatusText("Error: Failed to analyze resume");

      // 2. Safely grab the text whether Puter returns a string or an object
      let feedbackText = "";
      if (typeof feedback === "string") {
        feedbackText = feedback;
      } else if ((feedback as any)?.message?.content) {
        const content = (feedback as any).message.content;
        feedbackText =
          typeof content === "string" ? content : content[0]?.text || "";
      } else {
        feedbackText = JSON.stringify(feedback);
      }

      // 3. Extract strictly the JSON boundaries
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          `AI didn't return JSON. Response: ${feedbackText.substring(0, 80)}...`,
        );
      }

      data.feedback = JSON.parse(jsonMatch[0]);
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      return setStatusText(
        `Error: ${err.message || "Analysis failed or AI returned invalid format."}`,
      );
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText('Analysis complete, redirecting...');

    navigate(`/resume/${uuid}`);
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                alt="Resume Scan gif"
                className="w-full"
              />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvementtips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  placeholder="Company Name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  id="job-title"
                  placeholder="Job Title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  id="job-description"
                  placeholder="Job Description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button type="submit" className="primary-button">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default upload;
