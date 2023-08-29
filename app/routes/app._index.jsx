import { Layout, Page, VerticalStack } from "@shopify/polaris";

export default function Index() {
  return (
    <Page>
      <ui-title-bar title="This is a demo app by NamLN"></ui-title-bar>
      <h1 className="text-xl font-bold">Main functions</h1>
      <ul className="space-y-4 list-decimal list-inside pt-6">
        <li>
          Manage products
          <ol className="pl-5 mt-2 space-y-1 list-disc list-inside">
            <li>
              List all products with name and description in a paginated table
            </li>
            <li>Allow choosing a specific product for editing</li>
            <li>
              <b>Note: </b>Click on <b>"Manage products"</b> tab to continue
            </li>
          </ol>
        </li>
      </ul>
      <p className="italic pt-4">More functions are on the way...</p>
    </Page>
  );
}
