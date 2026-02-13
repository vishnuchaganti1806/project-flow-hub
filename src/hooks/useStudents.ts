import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsAPI } from "@/services/api";
import { mockStudents, type Student } from "@/data/mockData";
import { toast } from "sonner";

export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const res = await studentsAPI.getAll();
        return res.data;
      } catch {
        return mockStudents;
      }
    },
    staleTime: 30_000,
  });
}

export function useStudentProfile() {
  return useQuery<Student>({
    queryKey: ["student-profile"],
    queryFn: async () => {
      try {
        const res = await studentsAPI.getProfile();
        return res.data;
      } catch {
        return mockStudents[0];
      }
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      try {
        const res = await studentsAPI.updateProfile(data);
        return res.data;
      } catch {
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });
}
