import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const toLabel = (value) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ReviewerReportModal = ({
  open,
  onOpenChange,
  loading = false,
  error = "",
  report = null,
  title = "Reviewer Report",
}) => {
  const reviewerForm =
    report?.reviewer_form && typeof report.reviewer_form === "object"
      ? report.reviewer_form
      : null;
  const hasReviewerForm = Boolean(reviewerForm && Object.keys(reviewerForm).length > 0);

  const qualityFields = [
    "depth_of_research",
    "use_of_references",
    "clarity_of_writing",
    "relevance_to_scope",
    "contribution_to_field",
    "discussion_of_research",
    "structure_and_organization",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            View the reviewer feedback in a consistent format.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading reviewer report...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : report ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-2">
              <div>
                <span className="font-medium">Article:</span> {report.article_title || "-"}
              </div>
              <div>
                <span className="font-medium">Status:</span> {report.status || "-"}
              </div>
              <div>
                <span className="font-medium">Submitted:</span> {formatDateTime(report.reviewer_submitted_at)}
              </div>
              <div>
                <span className="font-medium">Article ID:</span> {report.article_id || "-"}
              </div>
            </div>

            {hasReviewerForm ? (
              <div className="space-y-2">
                <p className="font-medium">Reviewer Summary</p>
                <div className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Reviewer Name:</span>{" "}
                    {reviewerForm.reviewer_name || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Recommend For Publication:</span>{" "}
                    {reviewerForm.recommend_for_publication ? "Yes" : "No"}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Reviewer Decision:</span>{" "}
                    {reviewerForm.reviewer_decision || "-"}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Quality Ratings</p>
                  <div className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-2">
                    {qualityFields.map((field) => (
                      <div key={field} className="rounded-md bg-muted/30 p-2">
                        <span className="font-medium">{toLabel(field)}:</span>{" "}
                        {reviewerForm[field] || "-"}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Comments And Feedback</p>
                  <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-muted/30 p-3 whitespace-pre-wrap">
                    {reviewerForm.comments_and_feedback || "No reviewer comments available."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">Reviewer Report</p>
                <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/30 p-3 whitespace-pre-wrap">
                  {report.reviewer_report || "No reviewer report available."}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reviewer report available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewerReportModal;
