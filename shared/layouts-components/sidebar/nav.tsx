

import * as Svgicons from "./menusvg-icons";

export const MENUITEMS: any = [
  {
     menutitle:'TỔNG QUAN'
  },
  {
    title: "Dashboard",
    icon: Svgicons.Dashboardicon,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/dashboard"
  },
  {
     menutitle:'TỔ CHỨC'
  },
  {
    title: "Quản Lý Khoa",
    icon: Svgicons.Applicationicon,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/faculties"
  },
  {
    title: "Quản Lý Bộ Môn",
    icon: Svgicons.Nestedmenuicon,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/departments"
  },
  {
     menutitle:'GIÁO VIÊN'
  },
  {
    title: "Danh Sách Giáo Viên",
    icon: Svgicons.Teamicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/teachers"
  },
  {
    title: "Học Hàm & Học Vị",
    icon: Svgicons.Schoolicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/degrees"
  },
  {
    title: "Chức Vụ",
    icon: Svgicons.Profilesettingicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/positions"
  },
  {
     menutitle:'GIẢNG DẠY'
  },
  {
    title: "Học Phần",
    icon: Svgicons.Courseicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/courses"
  },
  {
    title: "Phân Công Giảng Dạy",
    icon: Svgicons.Taskicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/teaching-assignments"
  },
  {
     menutitle:'NGHIÊN CỨU KHOA HỌC'
  },
  {
    title: "Công Trình NCKH",
    icon: Svgicons.Projectsicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/research"
  },
  {
     menutitle:'BÁO CÁO & THỐNG KÊ'
  },
  {
    title: "Báo Cáo Giảng Dạy",
    icon: Svgicons.Chartsicon,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/reports/teaching"
  },
  {
    title: "Báo Cáo Nghiên Cứu",
    icon: Svgicons.Analyticsicon2,
    type: "link",
    active: false,
    selected: false,
    dirchange: false,
    path: "/reports/research"
  },
]