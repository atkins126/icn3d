Node.js Scripts based on iCn3D
==============================

Either Python scripts in the directory "icn3dpython" or Node.js scripts in the directory "icn3dnode" can be used to analyze structures in command line.

In your Node.js scripts, you can call iCn3D JavaScript functions in [icn3d npm package](https://www.npmjs.com/package/icn3d). You can then run these scripts in command line <b>with one second sleep time in between</b>. Here show a few examples. 

Installation
------------

Install the following packages:

    npm install three
    npm install jquery
    npm install icn3d
    
    npm install axios
    npm install querystring

Examples
--------

* <b>Ligand-Protein Interactions</b>

    In the command line, run the following:

        node ligand.js 5R7Y JFM

    This finds the residues in the PDB structure "5R7Y" interacting with the ligand with a residue name "JFM". The output looks like the following:

        5R7Y, 5R7Y_A, 164, H, 3C-like proteinase, JFM
        ...

* <b>Retrieve Annotations for PDB or AlphaFold Structures</b>

    In the command line, run the following command with the annotation type defined as: "1" for SNPs, "2 for ClinVar, "3" for Conserved Domains, "4" for Functional Sites, "5" for 3D Domains, "6" for Interactions, "7" for Disulfide Bonds, "8" for Cross-Linkages, and "9" for Post-Translational Modification (PTM). 

        node annotation.js Q08426 1

    This retrieves the SNP annotations for the AlphaFold UniProt ID Q08426. It also works for any PDB ID. The output listed the residues with SNPs for each chain:

        Q08426_A        [{"Q08426_A_3":"3E>A"},{"Q08426_A_3":"3E>K"},{"Q08426_A_4":"4Y>H"}...

* <b>Protein-Protein Interactions</b>

    In the command line, run the following:

        node epitope.js 7BWJ E L

    This finds the residues in the chain "E" of the PDB structure "7BWJ" interacting with the chain "L". The output looks like the following:

        7BWJ, 7BWJ_E, 483, V, SARS-CoV-2 receptor binding domain, 7BWJ_L, 31, G, antibody light chain
        ...        
    
* <b>Protein-Protein Interactions Due to Mutations</b>

    In the command line, run the following:
    
        node interaction2.js 6M0J E 501 Y
    
    This finds the change of interactions between the RDB domain (chain "E") of SAR-Cov-2 (PDB ID 6M0J) and ACE2 due to the mutation N501Y. The output looks like the following:
    
        6M0J, 6M0J_E, 501, N, Y, 0, 0, 9, 0, 1, 1
        
    where "0, 0, 9, 0, 1, 1" means the change of hydrogen bonds, salt bridges, contacts, halogen bonds, Pi-Cation interactions, Pi-Stacking interactions are 0, 0, 9, 0, 1, 1, respectively for the mutation N to Y at position 501.

* <b>Show Domain and Site Information for a Protein</b>

    In the command line, run the following:
    
        node cdsearch.js YP_009724390 hits
        node cdsearch.js YP_009724390 feats
    
    The first command finds the binding site information for the RefSeq protein "YP_009724390". The output looks like the following:
    
        YP_009724390    417     K       cd21480 SARS-CoV-2_Spike_S1_RBD 1       receptor binding site   6XR8,7CWL
        ...
        
    where "417" is the residue position, "K" is the residue name, "cd21480" is the domain ID, "SARS-CoV-2_Spike_S1_RBD" is the domain name, "1" is the site index, "receptor binding site" is the site type, "6XR8,7CWL" is the example PDB IDs.
    
    
    The second command finds the domain information for the RefSeq protein "YP_009724390". The output looks like the following:
    
        YP_009724390    62      V       pfam01601       Corona_S2       1       superfamily     6XR8,7CWL    
        ...
        
    where "62" is the residue position, "V" is the residue name, "pfam01601" is the domain ID, "Corona_S2" is the domain name, "1" is the index, "superfamily" is the domain type, "6XR8,7CWL" is the example PDB IDs.
        