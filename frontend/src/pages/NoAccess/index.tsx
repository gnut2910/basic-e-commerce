import PageBreadcrumb from "../../components/PageBreadCrumb";

export default function NoAccess() {
  return (
    <>
      <PageBreadcrumb pageTitle="err" />
      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>403 - No Access</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    </>
  );
}
