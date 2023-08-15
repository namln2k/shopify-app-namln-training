import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRevalidator,
  useSubmit,
} from "@remix-run/react";
import {
  Button,
  DataTable,
  Layout,
  LegacyCard,
  Page,
  PageActions,
  TextField,
  VerticalStack,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { NOTIFICATION_TYPES } from "~/constants";
import { useNotificationContext } from "~/contexts/notification";
import { createErrorMessageFromArray } from "~/utils/notification";
import { authenticate } from "../shopify.server";

export const loader = async (data) => {
  const { request } = data;
  const { admin } = await authenticate.admin(request);

  const urlObj = new URL(request.url);
  const productId = urlObj.searchParams.get("id");

  // Fetch product information and its variants' data
  const response = await admin.graphql(
    `query {
      product(id: "gid://shopify/Product/${productId}") {
        id
        title
        description
        variants(first: 250) {
          nodes {
            id
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

export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);

  /**
   * Get data from request
   * Variants data needs to be parsed as it is in JSON format
   */
  const postData = Object.fromEntries(await request.formData());
  const { title, id, descriptionHtml, variants: variantsJSON } = postData;
  const variants = JSON.parse(variantsJSON);

  const result = { success: true, errors: [] };

  // Update product information
  const productUpdate = await admin.graphql(
    `mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          descriptionHtml
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          id,
          title,
          descriptionHtml,
        },
      },
    }
  );

  const productUpdateResponse = await productUpdate.json();

  const productUpdateResult = productUpdateResponse?.data?.productUpdate;

  // Append errors to array (If any)
  if (
    productUpdateResult.userErrors &&
    productUpdateResult.userErrors.length > 0
  ) {
    result.success = false;
    // @ts-ignore
    result.errors = [...result.errors, ...productUpdateResult.userErrors];
  }

  // Update product variants information
  for (let i = 0; i < variants.length; i++) {
    const variantUpdate = await admin.graphql(
      `mutation productVariantUpdate($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant {
            price
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: { id: variants[i].id, price: variants[i].price },
        },
      }
    );

    const variantUpdateResponse = await variantUpdate.json();

    const variantUpdateResult =
      variantUpdateResponse?.data?.productVariantUpdate;

    // Append errors to array (If any)
    if (
      variantUpdateResult.userErrors &&
      variantUpdateResult.userErrors.length > 0
    ) {
      result.success = false;
      // @ts-ignore
      result.errors = [...result.errors, ...variantUpdateResult.userErrors];
    }
  }

  return result;
}

export default function ProductsEdit() {
  const [productTitle, setProductTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [tableRows, setTableRows] = useState([]);

  const navigate = useNavigate();

  const actionData = useActionData() || {};

  const revalidator = useRevalidator();

  const nav = useNavigation();

  const submit = useSubmit();

  const [notification, setNotification] = useNotificationContext();

  const isSaving = nav.state === "submitting" && nav.formMethod === "POST";

  const productData = useLoaderData();

  const productVariants = productData.variants?.nodes;

  useEffect(() => {
    // Fill product data into page
    setProductTitle(productData.title);
    setDescriptionHtml(productData.description);
    setVariants(productVariants);
  }, [productData]);

  useEffect(() => {
    console.log(actionData);
    // Process result from this route's action and fire notification messages
    const { errors, success } = actionData;

    if (errors?.length > 0) {
      // @ts-ignore
      setNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: createErrorMessageFromArray(
          errors.map((error) => error.message)
        ),
      });
    }

    if (success) {
      // @ts-ignore
      setNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: "Your changes have been saved!",
      });
    }
  }, [actionData]);

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
          // @ts-ignore
          value={variants[index]?.price}
          onChange={(newValue) => {
            // @ts-ignore
            setVariants((prev) =>
              prev?.map((item, i) =>
                i === index
                  ? // @ts-ignore
                    { ...item, price: newValue, isEdited: true }
                  : item
              )
            );
          }}
          autoComplete="off"
        />,
      ])
    );
  }, [variants]);

  const handleSave = () => {
    const data = {
      id: productData.id || "",
      title: productTitle,
      descriptionHtml: descriptionHtml,
      variants: JSON.stringify(
        variants
          // @ts-ignore
          // Only submit variants that has been edited
          .filter((variant) => variant.isEdited)
          // @ts-ignore
          .map((variant) => ({ id: variant.id, price: variant.price }))
      ),
    };

    submit(data, { method: "post" });
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
          All Products
        </button>
        <button
          onClick={() => {
            navigate("/app/products/all");
          }}
        >
          Back
        </button>
      </ui-title-bar>
      <LegacyCard>
        <div className="p-12">
          <Layout>
            <Layout.Section>
              <VerticalStack gap="5">
                <TextField
                  id="title"
                  value={productTitle}
                  onChange={(newValue) => setProductTitle(newValue)}
                  label="Product Title"
                  type="text"
                  autoComplete="none"
                />
                <TextField
                  id="description"
                  value={descriptionHtml}
                  onChange={(newValue) => setDescriptionHtml(newValue)}
                  label="Product Description"
                  type="text"
                  autoComplete="none"
                />
                <div className="py-4">
                  <Button
                    onClick={() => {
                      setShowVariants((prev) => !prev);
                    }}
                  >
                    {showVariants ? "Hide Variants" : "Show Variants"}
                  </Button>
                  <div className={`${!showVariants && "hidden"}`}>
                    <DataTable
                      columnContentTypes={["text", "text"]}
                      headings={["Variant", "Price"]}
                      rows={tableRows}
                      hoverable
                    />
                  </div>
                </div>
              </VerticalStack>
            </Layout.Section>
            <Layout.Section>
              <PageActions
                secondaryActions={[
                  {
                    content: "Reset all",
                    disabled: !productData.id || isSaving,
                    outline: true,
                    onAction: revalidator.revalidate,
                  },
                ]}
                primaryAction={{
                  content: "Save",
                  loading: isSaving,
                  disabled: !productData.id || isSaving,
                  onAction: handleSave,
                }}
              />
            </Layout.Section>
          </Layout>
        </div>
      </LegacyCard>
    </Page>
  );
}
