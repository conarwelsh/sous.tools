import { gql } from "@apollo/client";

export const GET_ACTIVE_LAYOUT = gql`
  query GetActiveLayout($hardwareId: String!) {
    activeLayout(hardwareId: $hardwareId) {
      id
      name
      structure
      content
      config
    }
  }
`;

export const PRESENTATION_UPDATED_SUBSCRIPTION = gql`
  subscription OnPresentationUpdated($hardwareId: String!) {
    presentationUpdated(hardwareId: $hardwareId) {
      id
      name
      structure
      content
      config
    }
  }
`;
