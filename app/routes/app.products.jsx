import {
  Outlet,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react";
import {
  Button,
  DataTable,
  Layout,
  LegacyCard,
  Page,
  VerticalStack,
} from "@shopify/polaris";

import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async (data) => {
  const { request, params } = data;
  const { admin } = await authenticate.admin(request);

  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
  console.log(request, request.getRequestURL());

  const lastCursor = request.parsedURL.searchParams.lastCursor;

  const response = await admin.graphql(
    `query ($numProducts: Int!, $cursor: ${lastCursor}) {
      products(first: $numProducts, after: ${lastCursor}) {
        nodes {
          id
          title
          description
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }`,
    {
      variables: {
        numProducts: 5,
        cursor: null,
      },
    }
  );

  const responseJson = await response.json();

  return responseJson.data;
};

export default function Products() {
  const [currentPage, setCurrentPage] = useState(0);
  const [buttonPrevDisabled, setButtonPrevDisabled] = useState(true);
  const [buttonNextDisabled, setButtonNextDisabled] = useState(false);
  const [lastCursor, setLastCursor] = useState();

  let [searchParams, setSearchParams] = useSearchParams();

  const loaderData = useLoaderData();
  const products = loaderData.products.nodes;

  const toNextPage = () => {
    setSearchParams(new URLSearchParams({ lastCursor: String(lastCursor) }));

    revalidator.revalidate();
  };

  const tableRows = products.map((product) => {
    product.id = product.id.replace("gid://shopify/Product/", "");

    return Object.values(product);
  });

  useEffect(() => {
    if (currentPage != 0) {
      setButtonPrevDisabled(false);
    }
  }, [currentPage]);

  const revalidator = useRevalidator();

  return (
    <Page>
      <Outlet />
      <ui-title-bar title="Edit product"></ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <LegacyCard>
              <div className="p-12">
                <div className="border-t-2 border-gray-500">
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["ID", "Title", "Description"]}
                    rows={tableRows}
                    hoverable
                  />
                  <div className="w-full flex justify-end gap-6 mr-0 pr-12 pt-8 border-t-2 border-gray-500">
                    <Button disabled={buttonPrevDisabled}>Prev</Button>
                    <Button disabled={buttonNextDisabled} onClick={toNextPage}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
