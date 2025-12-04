import mohitImage from "@/assets/students/mohit-singh.jpg";

export interface RegisteredStudent {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  batch: string;
  profileImage: string;
  status: 'active' | 'inactive';
}

export const registeredStudents: RegisteredStudent[] = [
  {
    id: "STU001",
    rollNo: "184",
    name: "Mohit Singh",
    email: "mohit.singh@university.edu",
    department: "Computer Science",
    batch: "2024",
    profileImage: mohitImage,
    status: "active"
  }
];

export const getStudentByName = (name: string): RegisteredStudent | undefined => {
  return registeredStudents.find(s => 
    s.name.toLowerCase().includes(name.toLowerCase())
  );
};
