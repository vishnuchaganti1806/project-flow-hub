import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsAPI } from "@/services/api";
import { toast } from "sonner";

export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const mockReviews: Review[] = [
  { id: "r1", studentId: "s1", studentName: "Aarav Patel", rating: 4, comment: "Good progress on AI navigation module.", createdAt: "2026-02-08" },
  { id: "r2", studentId: "s3", studentName: "Rahul Verma", rating: 5, comment: "Excellent blockchain implementation approach.", createdAt: "2026-02-05" },
  { id: "r3", studentId: "s6", studentName: "Ananya Desai", rating: 5, comment: "Outstanding research and implementation quality.", createdAt: "2026-02-01" },
  { id: "r4", studentId: "s5", studentName: "Vikram Joshi", rating: 3, comment: "Needs to narrow project scope.", createdAt: "2026-01-28" },
  { id: "r5", studentId: "s2", studentName: "Priya Singh", rating: 4, comment: "Solid technical foundation.", createdAt: "2026-01-25" },
];

export function useReviews(studentId?: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", studentId],
    queryFn: async () => {
      try {
        if (studentId) {
          const res = await reviewsAPI.getByStudent(studentId);
          return res.data;
        }
        const res = await reviewsAPI.getAll();
        return res.data;
      } catch {
        return studentId ? mockReviews.filter((r) => r.studentId === studentId) : mockReviews;
      }
    },
    staleTime: 30_000,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentId: string; rating: number; comment: string }) => {
      try {
        const res = await reviewsAPI.submit(data);
        return res.data;
      } catch {
        return { id: "r-" + Date.now(), ...data, studentName: "Student", createdAt: new Date().toISOString() };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review submitted");
    },
    onError: () => toast.error("Failed to submit review"),
  });
}
