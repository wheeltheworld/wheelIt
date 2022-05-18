import React from "react";
import axios from "axios";
import { Button } from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import FormGenerator from "../components/FormGenerator";
import { useEntity } from "../utils/hooks/useEntity";
import useManifest from "../utils/hooks/useManifest";
import { Link as RouterLink } from "react-router-dom";

interface EditPageProps {
  moduleName: string;
  modelName: string;
  by: string;
}

const EditPage: React.FC<EditPageProps> = ({ moduleName, modelName, by }) => {
  const { value } = useParams<{ value: string }>();
  const entity = useEntity({
    moduleName,
    modelName,
    by,
    value,
  });
  const { push } = useHistory();
  const { manifest, endpoint, get } = useManifest();

  if (!manifest) {
    return null;
  }

  const fields = get({ moduleName, modelName }).fields;

  const handleSubmit = async (data: any) => {
    const { data: ent } = await axios.patch(
      endpoint({
        modelName,
        moduleName,
        by,
        value,
      }),
      data
    );

    const indexable = fields.indexables[0]?.name;

    if (indexable) {
      push(`/_/${moduleName}/${modelName}/${indexable}/${ent[indexable]}`);
    }
  };

  const handleDelete = async () => {
    await axios.delete(
      endpoint({
        modelName,
        moduleName,
        by,
        value,
      })
    );
    push(`/_/${moduleName}/${modelName}`);
  };

  if (!entity) {
    return null;
  }

  return (
    <>
      <Button as={RouterLink} to={`/_/${moduleName}/${modelName}`}>
        Go Back
      </Button>
      <Button colorScheme="red" onClick={handleDelete}>
        Delete
      </Button>
      <FormGenerator
        fields={fields.all}
        onSubmit={handleSubmit}
        initValues={entity}
      />
    </>
  );
};

export default EditPage;
