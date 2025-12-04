import mohitImage from "@/assets/students/mohit-singh.jpg";
import ayushImage from "@/assets/students/ayush-singh.jpg";
import amanImage from "@/assets/students/aman-singh.jpg";
import riyaImage from "@/assets/students/riya-singh.jpg";

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
  },
  {
    id: "STU002",
    rollNo: "180",
    name: "Ayush Singh",
    email: "ayush.singh@university.edu",
    department: "Computer Science",
    batch: "2024",
    profileImage: ayushImage,
    status: "active"
  },
  {
    id: "STU003",
    rollNo: "177",
    name: "Aman Singh",
    email: "aman.singh@university.edu",
    department: "Computer Science",
    batch: "2024",
    profileImage: amanImage,
    status: "active"
  },
  {
    id: "STU004",
    rollNo: "1",
    name: "Riya Singh",
    email: "riya.singh@university.edu",
    department: "Computer Science",
    batch: "2024",
    profileImage: riyaImage,
    status: "active"
  }
];

export const getStudentByName = (name: string): RegisteredStudent | undefined => {
  return registeredStudents.find(s => 
    s.name.toLowerCase().includes(name.toLowerCase())
  );
};
