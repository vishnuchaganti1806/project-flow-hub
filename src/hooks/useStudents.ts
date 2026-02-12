import { useQuery } from "@tanstack/react-query";
import { studentsAPI } from "@/services/api";
import { mockStudents, type Student } from "@/data/mockData";

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
