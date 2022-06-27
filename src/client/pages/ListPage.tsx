import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  Flex,
  Link,
  Input,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import type { Field, ManifestRelation } from "../../shared/manifest";
import Paginator from "../components/Paginator";
import { useEntities } from "../utils/hooks/useEntities";
import useManifest from "../utils/hooks/useManifest";
import { useQuery } from "../utils/hooks/useQuery";

interface ListPageProps {
  moduleName: string;
  modelName: string;
}

type FieldsAndRels = (Field | ManifestRelation)[];

const ListPage: React.FC<ListPageProps> = ({ moduleName, modelName }) => {
  const query = useQuery();
  const manifest = useManifest().get({ moduleName, modelName });

  const [ page, setPage ] = useState(Number(query.get("page")) || 1);
  const [ amount, setAmount ] = useState(Number(query.get("amount")) || 25);
  const [ search, setSearch ] = useState(query.get("search") || "");

  const { push } = useHistory();
  const { items, pages } = useEntities({
    moduleName,
    modelName,
    page: page - 1,
    amount,
    query: search,
  });

  const listableRels: FieldsAndRels = manifest?.relations.filter(f => f.isListable && !f.isHidden);
  const indexableRels: FieldsAndRels = manifest?.relations.filter((f) => f.indexable);

  const listables: FieldsAndRels = ([] as FieldsAndRels)
    .concat(manifest?.fields.listables, listableRels)
    .filter(Boolean);
  const indexables: FieldsAndRels = ([] as FieldsAndRels)
    .concat(manifest?.fields.indexables, indexableRels)
    .filter(Boolean);

  listables.sort((a, b) => (a.position > b.position) ? 1 : -1);
  indexables.sort((a, b) => (a.position > b.position) ? 1 : -1);

  console.log(listables);
  console.log(indexables);


  useEffect(() => {
    push(
      `/_/${moduleName}/${modelName}?page=${page}&amount=${amount}&search=${search}`
    );
  }, [page, amount, search]);

  return (
    <>
      <Flex justify="space-between">
        <Button as={RouterLink} to={`/_/${moduleName}/${modelName}/create`}>
          Create {modelName}
        </Button>
        <Input
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          value={search}
          maxW="300px"
        />
        <Paginator
          page={page}
          pages={pages || 1}
          onChange={({ number, amount }) => {
            setAmount(amount);
            setPage(number);
          }}
        />
      </Flex>
      <Table mt="20px">
        <Thead>
          <Tr>
            {listables.map((field) => {
              return <Th key={field.name}>{field.label || field.name}</Th>
            })}
          </Tr>
        </Thead>
        <Tbody>
          {items?.map((item, i) => (
            <Tr key={i}>
              {listables.map((field) => {
                let value = item[field.name];
                if (field.type === "date") {
                  value = `${value.day}/${value.month}/${value.year}`;
                }
                if (field.type === "select") {
                  value = field.options.find((o) => o.value === value)?.label;
                }
                if (field.type === "multiselect") {
                  value = value
                    .map(
                      (v: string) =>
                        field.options.find((o) => o.value === v)?.label
                    )
                    .join(", ");
                }
                value = value?.toString();
                return (
                  <Td key={field.name}>
                    {indexables
                      .map((f) => f.name)
                      .includes(field.name) ? (
                      <Link
                        as={RouterLink}
                        to={`/_/${moduleName}/${modelName}/${field.name}/${
                          item[field.name]
                        }`}
                      >
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default ListPage;
