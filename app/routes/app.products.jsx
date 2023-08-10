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
  const { request } = data;
  const { admin } = await authenticate.admin(request);

  const urlObj = new URL(request.url);
  const startCursor = urlObj.searchParams.get("startCursor");
  const endCursor = urlObj.searchParams.get("endCursor");

  let response;

  if (startCursor) {
    response = await admin.graphql(
      `query ($numProducts: Int!, $cursor: String) {
        products(last: $numProducts, before: $cursor) {
          nodes {
            id
            title
            description
          }
          pageInfo {
            startCursor
            hasPreviousPage
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        variables: {
          numProducts: 3,
          cursor: startCursor,
        },
      }
    );
  } else {
    response = await admin.graphql(
      `query ($numProducts: Int!, $cursor: String) {
        products(first: $numProducts, after: $cursor) {
          nodes {
            id
            title
            description
          }
          pageInfo {
            startCursor
            hasPreviousPage
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        variables: {
          numProducts: 3,
          cursor: endCursor || null,
        },
      }
    );
  }

  if (response) {
    const responseJson = await response.json();

    return responseJson.data;
  } else {
    return null;
  }
};

export default function Products() {
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [startCursor, setStartCursor] = useState(null);
  const [endCursor, setEndCursor] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const revalidator = useRevalidator();

  const loaderData = useLoaderData();

  const products = loaderData?.products.nodes;
  const pageInfo = loaderData?.products.pageInfo;

  useEffect(() => {
    setEndCursor(pageInfo?.endCursor);
    setStartCursor(pageInfo?.startCursor);

    setHasNextPage(!!pageInfo?.hasNextPage);
    setHasPreviousPage(!!pageInfo?.hasPreviousPage);
  }, [loaderData]);

  const handleButtonPrevClicked = () => {
    setSearchParams(new URLSearchParams({ startCursor: String(startCursor) }));

    revalidator.revalidate();
  };

  const handleButtonNextClicked = () => {
    setSearchParams(new URLSearchParams({ endCursor: String(endCursor) }));

    revalidator.revalidate();
  };

  const tableRows =
    products?.map((product) => {
      product.id = product.id.replace("gid://shopify/Product/", "");

      return Object.values(product);
    }) || [];

  return (
    <Page>
      <Outlet />
      <ui-title-bar title="All products"></ui-title-bar>
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
                    <Button
                      disabled={!hasPreviousPage}
                      onClick={() => {
                        handleButtonPrevClicked();
                      }}
                    >
                      Prev
                    </Button>
                    <Button
                      disabled={!hasNextPage}
                      onClick={() => {
                        handleButtonNextClicked();
                      }}
                    >
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
