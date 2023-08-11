import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Button,
  DataTable,
  Form,
  FormLayout,
  Layout,
  LegacyCard,
  Page,
  TextField,
  VerticalStack,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async (data) => {
  const { request } = data;
  const { admin } = await authenticate.admin(request);

  const urlObj = new URL(request.url);
  const productId = urlObj.searchParams.get("id");

  const response = await admin.graphql(
    `query {
      product(id: "gid://shopify/Product/${productId}") {
        id
        title
        description
        variants(first: 100) {
          nodes {
            title
            price
          }
        }
      }
    }`
  );

  if (response) {
    const responseData = await response.json();

    const { product } = responseData.data;

    return product;
  } else {
    return null;
  }
};

export default function ProductsEdit() {
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [showVariants, setShowVariants] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [startCursor, setStartCursor] = useState(null);
  const [endCursor, setEndCursor] = useState(null);
  const [variantPrices, setVariantPrices] = useState([]);
  const [tableRows, setTableRows] = useState([]);

  const navigate = useNavigate();

  const productData = useLoaderData();
  const productVariants = productData.variants?.nodes;
  const pageInfo = productData.variants?.pageInfo;

  useEffect(() => {
    setProductTitle(productData.title);
    setProductDescription(productData.description);
    setVariantPrices(productVariants.map((variant) => variant.price));
  }, [productData]);

  useEffect(() => {
    setTableRows(
      productVariants.map((variant, index) => [
        <TextField
          label=""
          type="text"
          disabled
          value={variant.title}
          autoComplete="off"
        />,
        <TextField
          label=""
          type="number"
          value={variantPrices[index]}
          onChange={(newValue) => {
            // @ts-ignore
            setVariantPrices((prev) =>
              prev?.map((item, i) => (i === index ? newValue : item))
            );
          }}
          autoComplete="off"
        />,
      ])
    );
  }, [variantPrices]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <Page>
      <ui-title-bar title={productData.title}>
        <button
          // @ts-ignore
          variant="breadcrumb"
          onClick={() => {
            navigate("/app/products/all");
          }}
        >
          All Products &nbsp; &gt;
        </button>
        <button
          onClick={() => {
            navigate("/app/products/all");
          }}
        >
          Back
        </button>
      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <LegacyCard>
              <div className="p-12">
                <Form onSubmit={handleFormSubmit}>
                  <FormLayout>
                    <TextField
                      value={productTitle}
                      onChange={(newValue) => setProductTitle(newValue)}
                      label="Product Title"
                      type="text"
                      autoComplete="none"
                    />
                    <TextField
                      value={productDescription}
                      onChange={(newValue) => setProductDescription(newValue)}
                      label="Product Description"
                      type="text"
                      autoComplete="none"
                    />
                  </FormLayout>
                </Form>
                <div className="py-4 mt-4">
                  <button
                    onClick={() => {
                      setShowVariants((prev) => !prev);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 hover:font-bold py-3 w-40 rounded-md"
                  >
                    {showVariants ? "Hide Variants" : "Show Variants"}
                  </button>
                  <div className={`${!showVariants && "opacity-0"}`}>
                    <DataTable
                      columnContentTypes={["text", "text"]}
                      headings={["Variant", "Price"]}
                      rows={tableRows}
                      hoverable
                    />
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
