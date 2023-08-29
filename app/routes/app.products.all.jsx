import {
  Link,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react";
import { Button, DataTable, LegacyCard, Page } from "@shopify/polaris";
import { EditMajor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
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
    const responseData = await response.json();

    const { products: productsData } = responseData.data;

    return productsData;
  } else {
    return null;
  }
};

export default function ProductsAll() {
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [startCursor, setStartCursor] = useState(null);
  const [endCursor, setEndCursor] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const revalidator = useRevalidator();

  const productsData = useLoaderData();

  const products = productsData?.nodes;
  const pageInfo = productsData?.pageInfo;

  useEffect(() => {
    setEndCursor(pageInfo?.endCursor);
    setStartCursor(pageInfo?.startCursor);

    setHasNextPage(!!pageInfo?.hasNextPage);
    setHasPreviousPage(!!pageInfo?.hasPreviousPage);
  }, [productsData]);

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

      // Get all values of a product object and store in an array
      const dataArray = Object.values(product);

      if (dataArray.length === 0) {
        return [];
      }

      // Add button edit for every row
      dataArray.push(
        <Link to={`/app/products/edit?id=${product.id}`}>
          <button className="inline-flex justify-center w-24 py-2 bg-gray-200 hover:bg-gray-300 hover:font-bold text-sm font-medium rounded-md">
            <EditMajor
              width={20}
              height={20}
              color="rgb(59, 130, 246)"
              className="inline-block mr-2"
            />
            <span className="mr-1">Edit</span>
          </button>
        </Link>
      );

      return dataArray;
    }) || [];

  return (
    <Page>
      <ui-title-bar title="All Products"></ui-title-bar>
      <LegacyCard>
        <div className="p-12">
          <div className="border-t-2 border-gray-500">
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["ID", "Title", "Description", "Action"]}
              rows={tableRows}
              hoverable
              verticalAlign="middle"
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
    </Page>
  );
}
