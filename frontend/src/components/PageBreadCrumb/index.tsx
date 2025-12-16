import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto p-4  flex flex-wrap items-center justify-between gap-3">
        {/* <h2 className="text-3xl font-semibold text-gray-800" x-text="pageName">
          {pageTitle}
        </h2> */}
        <nav>
          <ol className="flex items-center">
            <li>
              <Link
                className="inline-flex items-center  text-sm text-gray-500 dark:text-gray-400"
                to="/"
              >
                Trang chủ
                {/* <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg> */}
                <span className="mx-1">/</span>
              </Link>
            </li>
            <li className="text-sm text-gray-700">{pageTitle}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageBreadcrumb;
